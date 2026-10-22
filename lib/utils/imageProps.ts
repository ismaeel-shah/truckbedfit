/**
 * Loading hints for plain <img> tags: above-the-fold images load immediately with
 * high priority (they're often the LCP element), everything else loads lazily.
 */
export function imgLoadingProps(priority = false) {
  return priority
    ? ({ loading: "eager", decoding: "async", fetchPriority: "high" } as const)
    : ({ loading: "lazy", decoding: "async" } as const);
}
