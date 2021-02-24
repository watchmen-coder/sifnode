import { watchEffect } from "@vue/runtime-core";

/**
 * A subscription is a function that subscribes to changes in something.
 * and returns an unsubscribe function. This is a convenience wrapper that
 * acts a little like useEffect in React to subscribe and then automatically
 * unsubscribe a subscription when it is no longer needed (eg. when a component is unmounted).
 * It automatically depends on all reactive inputs.
 * @param getSubscription Run the subscription, return the unsubscribe function
 */
export function useSubscription(getSubscription: () => () => void) {
  watchEffect((onInvalidateEffect) => {
    const unsubscribe = getSubscription();
    onInvalidateEffect(unsubscribe);
  });
}
