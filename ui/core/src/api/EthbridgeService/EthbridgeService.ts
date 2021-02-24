import { provider } from "web3-core";
import Web3 from "web3";
import { getBridgeBankContract } from "./bridgebankContract";
import { getTokenContract } from "./tokenContract";
import { AssetAmount, Token } from "../../entities";
import {
  createPegTxEventEmitter,
  PegTxEventEmitter,
} from "./PegTxEventEmitter";
import { confirmTx } from "./utils/confirmTx";
import { SifUnSignedClient } from "../utils/SifClient";
import { parseTxFailure } from "./parseTxFailure";
import { Contract } from "web3-eth-contract";

// TODO: Do we break this service out to ethbridge and cosmos?

export type EthbridgeServiceContext = {
  sifApiUrl: string;
  sifWsUrl: string;
  sifChainId: string;
  bridgebankContractAddress: string;
  bridgetokenContractAddress: string;
  getWeb3Provider: () => Promise<provider>;
  sifUnsignedClient?: SifUnSignedClient;
};

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function createEthbridgeService({
  sifApiUrl,
  sifWsUrl,
  sifChainId,
  bridgebankContractAddress,
  getWeb3Provider,
  sifUnsignedClient = new SifUnSignedClient(sifApiUrl, sifWsUrl),
}: EthbridgeServiceContext) {
  // Pull this out to a util?
  // How to handle context/dependency injection?
  let _web3: Web3 | null = null;
  async function ensureWeb3(): Promise<Web3> {
    if (!_web3) {
      _web3 = new Web3(await getWeb3Provider());
    }
    return _web3;
  }

  /**
   * Create an event listener to report status of a peg transaction.
   * Usage:
   * const tx = createPegTx(50)
   * tx.setTxHash('0x52ds.....'); // set the hash to lookup and confirm on the blockchain
   * @param confirmations number of confirmations before pegtx is considered confirmed
   */
  function createPegTx(confirmations: number): PegTxEventEmitter {
    const emitter = createPegTxEventEmitter();
    emitter.onTxHash(async ({ payload: txHash }) => {
      const web3 = await ensureWeb3();
      confirmTx({
        web3,
        txHash,
        confirmations,
        onSuccess() {
          console.log(
            "lockToSifchain: confirmTx SUCCESS",
            txHash,
            confirmations
          );
          emitter.emit({ type: "Complete", payload: null });
        },
        onCheckConfirmation(count) {
          console.log(
            "lockToSifchain: onCheckConfirmation PENDING",
            confirmations
          );
          emitter.emit({ type: "EthConfCountChanged", payload: count });
        },
      });
    });
    return emitter;
  }

  /**
   * Gets a list of transactionHashes found as _from keys within the given events within a given blockRange from the current block
   * @param {*} address eth address to correlate transactions with
   * @param {*} contract web3 contract
   * @param {*} eventList event name list of events (must have an addresskey)
   * @param {*} blockRange number of blocks from the current block header to search
   */
  async function getEventTxsInBlockrangeFromAddress(
    address: string,
    contract: Contract,
    eventList: string[],
    blockRange: number
  ) {
    const web3 = await ensureWeb3();
    const latest = await web3.eth.getBlockNumber();
    const fromBlock = Math.max(latest - blockRange, 0);
    const allEvents = await contract.getPastEvents("allEvents", {
      // filter:{_from:address}, // if _from was indexed we could do this
      fromBlock,
      toBlock: "latest",
    });

    // unfortunately because _from is not an indexed key we have to manually filter
    // TODO: ask peggy team to index the _from field which would make this more efficient
    const txs = [];
    for (let event of allEvents) {
      const isEventWeCareAbout = eventList.includes(event.event);

      const matchesInputAddress =
        event?.returnValues?._from?.toLowerCase() === address.toLowerCase();

      if (isEventWeCareAbout && matchesInputAddress && event.transactionHash) {
        txs.push(event.transactionHash);
      }
    }
    return txs;
  }

  return {
    async approveBridgeBankSpend(account: string, amount: AssetAmount) {
      // This will popup an approval request in metamask
      const web3 = await ensureWeb3();
      const tokenContract = await getTokenContract(
        web3,
        (amount.asset as Token).address
      );
      const sendArgs = {
        from: account,
        value: 0,
      };

      // only for usdt?
      if (amount.asset.symbol === "USDT") {
        const hasAlreadyApprovedSpend = await tokenContract.methods
          .allowance(account, bridgebankContractAddress)
          .call();

        if (hasAlreadyApprovedSpend >= amount.toBaseUnits().toString()) {
          // dont request approve again
          console.log(
            "approveBridgeBankSpend: spend already approved",
            hasAlreadyApprovedSpend
          );
          return;
        } else {
        } // else would need to approve for the difference ?
      }

      const res = await tokenContract.methods
        .approve(bridgebankContractAddress, amount.toBaseUnits().toString())
        .send(sendArgs);
      console.log("approveBridgeBankSpend:", res);
      return res;
    },

    async burnToEthereum(params: {
      fromAddress: string;
      ethereumRecipient: string;
      assetAmount: AssetAmount;
      feeAmount: AssetAmount;
    }) {
      const web3 = await ensureWeb3();
      const ethereumChainId = await web3.eth.net.getId();
      const tokenAddress =
        (params.assetAmount.asset as Token).address ?? ETH_ADDRESS;
      console.log("burnToEthereum: start: ", tokenAddress);

      const txReceipt = await sifUnsignedClient.burn({
        ethereum_receiver: params.ethereumRecipient,
        base_req: {
          chain_id: sifChainId,
          from: params.fromAddress,
        },
        amount: params.assetAmount.toBaseUnits().toString(),
        symbol: params.assetAmount.asset.symbol,
        cosmos_sender: params.fromAddress,
        ethereum_chain_id: `${ethereumChainId}`,
        token_contract_address: tokenAddress,
        ceth_amount: params.feeAmount.toBaseUnits().toString(),
      });

      console.log("burnToEthereum: txReceipt: ", txReceipt, tokenAddress);
      return txReceipt;
    },

    lockToSifchain(
      sifRecipient: string,
      assetAmount: AssetAmount,
      confirmations: number
    ) {
      const pegTx = createPegTx(confirmations);

      function handleError(err: any) {
        console.log("lockToSifchain: handleError: ", err);
        pegTx.emit({
          type: "Error",
          payload: parseTxFailure({ hash: "", log: err.message.toString() }),
        });
      }

      (async function() {
        const web3 = await ensureWeb3();
        const cosmosRecipient = Web3.utils.utf8ToHex(sifRecipient);

        const bridgeBankContract = await getBridgeBankContract(
          web3,
          bridgebankContractAddress
        );
        const accounts = await web3.eth.getAccounts();
        const coinDenom = (assetAmount.asset as Token).address ?? ETH_ADDRESS;
        const amount = assetAmount.numerator.toString();
        const fromAddress = accounts[0];

        const sendArgs = {
          from: fromAddress,
          value: coinDenom === ETH_ADDRESS ? amount : 0,
        };

        console.log(
          "lockToSifchain: bridgeBankContract.lock",
          JSON.stringify({ cosmosRecipient, coinDenom, amount, sendArgs })
        );

        bridgeBankContract.methods
          .lock(cosmosRecipient, coinDenom, amount)
          .send(sendArgs)
          .on("transactionHash", (hash: string) => {
            console.log("lockToSifchain: bridgeBankContract.lock TX", hash);
            pegTx.setTxHash(hash);
          })
          .on("error", (err: any) => {
            console.log("lockToSifchain: bridgeBankContract.lock ERROR", err);
            handleError(err);
          });
      })().catch(err => {
        handleError(err);
      });

      return pegTx;
    },

    async lockToEthereum(params: {
      fromAddress: string;
      ethereumRecipient: string;
      assetAmount: AssetAmount;
      feeAmount: AssetAmount;
    }) {
      const web3 = await ensureWeb3();
      const ethereumChainId = await web3.eth.net.getId();
      const tokenAddress =
        (params.assetAmount.asset as Token).address ?? ETH_ADDRESS;

      const lockParams = {
        ethereum_receiver: params.ethereumRecipient,
        base_req: {
          chain_id: sifChainId,
          from: params.fromAddress,
        },
        amount: params.assetAmount.toBaseUnits().toString(),
        symbol: params.assetAmount.asset.symbol,
        cosmos_sender: params.fromAddress,
        ethereum_chain_id: `${ethereumChainId}`,
        token_contract_address: tokenAddress,
        ceth_amount: params.feeAmount.toBaseUnits().toString(),
      };

      console.log("lockToEthereum: TRY LOCK", tokenAddress);
      const lockReceipt = await sifUnsignedClient.lock(lockParams);
      console.log("lockToEthereum: LOCKED", lockReceipt);

      return lockReceipt;
    },

    /**
     * Get a list of unconfirmed transaction hashes associated with
     * a particular address and return pegTxs associated with that hash
     * @param address contract address
     * @param confirmations number of confirmations required
     */
    async fetchUnconfirmedLockBurnTxs(
      address: string,
      confirmations: number
    ): Promise<PegTxEventEmitter[]> {
      const web3 = await ensureWeb3();

      const bridgeBankContract = await getBridgeBankContract(
        web3,
        bridgebankContractAddress
      );

      const txs = await getEventTxsInBlockrangeFromAddress(
        address,
        bridgeBankContract,
        ["LogBurn", "LogLock"],
        confirmations
      );

      return txs.map(txHash => {
        const pegTx = createPegTx(confirmations);
        pegTx.setTxHash(txHash);
        return pegTx;
      });
    },

    burnToSifchain(
      sifRecipient: string,
      assetAmount: AssetAmount,
      confirmations: number,
      account?: string
    ) {
      const pegTx = createPegTx(confirmations);

      function handleError(err: any) {
        console.log("burnToSifchain: handleError ERROR", err);
        pegTx.emit({
          type: "Error",
          payload: parseTxFailure({ hash: "", log: err }),
        });
      }

      (async function() {
        const web3 = await ensureWeb3();
        const cosmosRecipient = Web3.utils.utf8ToHex(sifRecipient);

        const bridgeBankContract = await getBridgeBankContract(
          web3,
          bridgebankContractAddress
        );
        const accounts = await web3.eth.getAccounts();
        const coinDenom = (assetAmount.asset as Token).address;
        const amount = assetAmount.numerator.toString();
        const fromAddress = account || accounts[0];

        const sendArgs = {
          from: fromAddress,
          value: 0,
          gas: 150000, // Note: This chose in lieu of burn(params).estimateGas({from})
        };

        bridgeBankContract.methods
          .burn(cosmosRecipient, coinDenom, amount)
          .send(sendArgs)
          .on("transactionHash", (hash: string) => {
            console.log("burnToSifchain: bridgeBankContract.burn TX", hash);
            pegTx.setTxHash(hash);
          })
          .on("error", (err: any) => {
            console.log("burnToSifchain: bridgeBankContract.burn ERROR", err);
            handleError(err);
          });
      })().catch(err => {
        handleError(err);
      });

      return pegTx;
    },
  };
}
