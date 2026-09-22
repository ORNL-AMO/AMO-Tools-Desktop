import { assertInInjectionContext, computed, inject, linkedSignal, Signal, untracked } from '@angular/core';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ExploreOpportunityCategory, Losses } from '../models/phast';
import { ModificationService } from '../services/modification.service';

type LossItem<K extends keyof Losses> = NonNullable<Losses[K]>[number];

/**
 * Loss types whose shared interface carries `id` and `name`. Narrowing `K` fails an incompatible
 * `lossKey` at the call site instead of with an opaque union-property error inside this file.
 */
type ComparableLossKey = {
  [K in keyof Losses]: 'id' extends keyof LossItem<K>
    ? ('name' extends keyof LossItem<K> ? K : never)
    : never;
}[keyof Losses];

export interface OpportunityFieldAccessor<TItem> {
  get(item: TItem): number | undefined;
  set(item: TItem, value: number): TItem;
}

export interface SectionedOpportunityConfig<K extends ComparableLossKey, TField extends string, TSection extends string> {
  lossKey: K;
  category: ExploreOpportunityCategory;
  displayName: string;
  fields: Record<TField, OpportunityFieldAccessor<LossItem<K>>>;
  /** Fields each per-loss "Modify X" checkbox owns; unchecking resets exactly these. */
  sections: Record<TSection, readonly TField[]>;
}

export interface SectionedOpportunityComparison<TItem, TField extends string> {
  id: string;
  name: string;
  baselineItem: TItem;
  modificationItem: TItem;
  baseline: Record<TField, number | undefined>;
  modification: Record<TField, number | undefined>;
}

export interface SectionedOpportunityState<K extends ComparableLossKey, TField extends string, TSection extends string> {
  readonly useOpportunity: Signal<boolean>;
  readonly comparisons: Signal<SectionedOpportunityComparison<LossItem<K>, TField>[]>;
  isExpanded(section: TSection, itemId: string): boolean;
  toggleOpportunity(hasOpportunity: boolean): void;
  toggleSection(section: TSection, itemId: string, show: boolean): void;
  setModificationValue(itemId: string, field: TField, value: number): void;
}

type ExpandedSections<TSection extends string> = Record<TSection, ReadonlySet<string>>;

/**
 * Shared baseline-vs-modification state for a per-loss "Explore Opportunities" EEM: a main toggle,
 * per-loss section toggles (each owning one or more fields), and reset-to-baseline on toggle-off.
 * Call from an injection context (e.g. a component constructor or field initializer).
 */
export function createSectionedOpportunityState<K extends ComparableLossKey, TField extends string, TSection extends string>(
  config: SectionedOpportunityConfig<K, TField, TSection>,
): SectionedOpportunityState<K, TField, TSection> {
  assertInInjectionContext(createSectionedOpportunityState);
  type Item = LossItem<K>;

  const assessmentService = inject(ProcessHeatingAssessmentService);
  const modificationService = inject(ModificationService);

  const fieldKeys = Object.keys(config.fields) as TField[];
  const sectionKeys = Object.keys(config.sections) as TSection[];
  const allSectionFields = sectionKeys.flatMap(section => config.sections[section]);

  const items = (scenario: AssessmentScenario): Item[] =>
    (assessmentService.lossSignal(scenario, config.lossKey) as Item[] | undefined) ?? [];

  const readValues = (item: Item): Record<TField, number | undefined> =>
    Object.fromEntries(fieldKeys.map(field => [field, config.fields[field].get(item)])) as Record<TField, number | undefined>;

  const useOpportunity: Signal<boolean> = computed(() =>
    modificationService.selectedModification()?.exploreOpportunityFlags?.[config.category]?.hasOpportunity ?? false
  );

  const comparisons: Signal<SectionedOpportunityComparison<Item, TField>[]> = computed(() => {
    const modificationId = modificationService.selectedModificationId();
    const modificationItems = modificationId ? items(modificationId) : [];

    return items('baseline').map(baselineItem => {
      const modificationItem = modificationItems.find(item => item.id === baselineItem.id) ?? baselineItem;
      return {
        id: baselineItem.id,
        name: baselineItem.name,
        baselineItem,
        modificationItem,
        baseline: readValues(baselineItem),
        modification: readValues(modificationItem),
      };
    });
  });

  const mapSections = (idsFor: (section: TSection) => Iterable<string>): ExpandedSections<TSection> =>
    Object.fromEntries(sectionKeys.map(section => [section, new Set(idsFor(section))])) as unknown as ExpandedSections<TSection>;

  const sectionsDifferingFromBaseline = (): ExpandedSections<TSection> => {
    const current = comparisons();
    return mapSections(section => current
      .filter(comparison => config.sections[section].some(field => comparison.baseline[field] !== comparison.modification[field]))
      .map(comparison => comparison.id));
  };

  /**
   * Seeded per modification from which sections already differ from baseline, then user-driven.
   * Seed reads are untracked so typing a value back to baseline doesn't collapse its section.
   */
  const expandedSections = linkedSignal<string | undefined, ExpandedSections<TSection>>({
    source: modificationService.selectedModificationId,
    computation: () => untracked(() => sectionsDifferingFromBaseline()),
  });

  /**
   * Maps over this modification's effective items, not raw baseline — else editing one item's
   * value discards another item's override.
   */
  function writeModificationItems(mapItem: (item: Item) => Item): void {
    const modification = modificationService.selectedModification();
    if (!modification) {
      return;
    }
    assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      [config.lossKey]: items(modification.id).map(mapItem),
    });
  }

  function resetToBaseline(shouldReset: (item: Item) => boolean, fields: readonly TField[]): void {
    const baselineItems = items('baseline');
    writeModificationItems(item => {
      const baselineItem = baselineItems.find(candidate => candidate.id === item.id);
      if (!baselineItem || !shouldReset(item)) {
        return item;
      }
      return fields.reduce((reset, field) => {
        const baselineValue = config.fields[field].get(baselineItem);
        return baselineValue === undefined ? reset : config.fields[field].set(reset, baselineValue);
      }, item);
    });
  }

  function isExpanded(section: TSection, itemId: string): boolean {
    return expandedSections()[section].has(itemId);
  }

  function toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    modificationService.setExploreOpportunityFlag(modificationId, config.category, {
      hasOpportunity,
      display: config.displayName,
    });

    /**
     * The merge no longer gates a loss-type diff on this flag (see scenario-merge.util.ts), so
     * deselecting has to actively reset the fields — otherwise they keep applying regardless.
     */
    if (!hasOpportunity) {
      expandedSections.set(mapSections(() => []));
      resetToBaseline(() => true, allSectionFields);
    }
  }

  function toggleSection(section: TSection, itemId: string, show: boolean): void {
    expandedSections.update(sections => {
      const ids = new Set(sections[section]);
      if (show) {
        ids.add(itemId);
      } else {
        ids.delete(itemId);
      }
      return { ...sections, [section]: ids };
    });

    if (!show) {
      resetToBaseline(item => item.id === itemId, config.sections[section]);
    }
  }

  function setModificationValue(itemId: string, field: TField, value: number): void {
    if (Number.isNaN(value)) {
      return;
    }
    writeModificationItems(item => (item.id === itemId ? config.fields[field].set(item, value) : item));
  }

  return { useOpportunity, comparisons, isExpanded, toggleOpportunity, toggleSection, setModificationValue };
}

/** Accessor for a field stored directly on the loss item. */
export function directField<TItem, P extends keyof TItem>(property: P): OpportunityFieldAccessor<TItem> {
  return {
    get: item => item[property] as number | undefined,
    set: (item, value) => ({ ...item, [property]: value }),
  };
}
