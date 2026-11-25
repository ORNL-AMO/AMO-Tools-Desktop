/**
 * A modification saved by the rebuilt Process Heating module can remove, add or reorder loss items, which it matches
 * to the baseline's by `id`. Legacy items may have no ids and always stay in the baseline's order.
 * @template T a loss item
 * @param baselineItem the baseline's loss item
 * @param baselineIndex the baseline item's position
 * @param modificationItems the modification's items of the same loss type
 * @returns the modification's matching item, or undefined when it has none
 */
export function findModificationLoss<T extends { id?: string }>(baselineItem: T, baselineIndex: number, modificationItems: T[] | undefined): T | undefined {
  if (baselineItem.id && modificationItems?.every(item => item.id)) {
    return modificationItems.find(item => item.id === baselineItem.id);
  }
  return modificationItems?.[baselineIndex];
}
