import { ActionContext } from "..";
import { createSubscribeToTx } from "./utils/subscribeToTx";

export const subscribeToUnconfirmedPegTxs = ({
  api,
  store,
  ethConfirmations,
}: ActionContext<"EthbridgeService", "tx" | "wallet"> & {
  ethConfirmations: number;
}) => (address: string) => {
  // Update a tx state in the store
  const subscribeToTx = createSubscribeToTx({ store });

  async function getSubscriptions() {
    const pendingTxs = await api.EthbridgeService.fetchUnconfirmedLockBurnTxs(
      address,
      ethConfirmations
    );

    return pendingTxs.map(subscribeToTx);
  }

  // Need to keep subscriptions syncronous so using promise
  const subscriptionsPromise = getSubscriptions();

  // Return unsubscribe synchronously
  return () => {
    subscriptionsPromise.then(subscriptions =>
      subscriptions.forEach(unsubscribe => unsubscribe())
    );
  };
};
