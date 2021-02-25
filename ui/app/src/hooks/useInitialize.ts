import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";

export function useInitialize() {
  const { actions, store } = useCore();
  // initialize subscriptions
  useSubscription(() =>
    actions.peg.subscribeToUnconfirmedPegTxs(store.wallet.eth.address)
  );
}
