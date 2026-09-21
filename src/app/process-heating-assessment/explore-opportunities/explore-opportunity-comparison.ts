import { computed, inject, Signal } from '@angular/core';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ExploreOpportunityCategory, Losses } from '../models/phast';
import { ModificationService } from '../services/modification.service';

type LossItem<K extends keyof Losses> = NonNullable<Losses[K]>[number];

/**
 * Loss types with `id`/`name` (charge materials, wall losses, ...) — atmosphere, other, etc. don't
 * carry either. Narrowing `K` fails an incompatible `lossKey` at the call site instead of with an
 * opaque union-property error inside this file.
 */
type ComparableLossKey = {
  [K in keyof Losses]: 'id' extends keyof LossItem<K>
    ? ('name' extends keyof LossItem<K> ? K : never)
    : never;
}[keyof Losses];

export interface OpportunityValueComparison {
  id: string;
  name: string;
  baselineValue: number | undefined;
  modificationValue: number | undefined;
}

export interface OpportunityComparisonState<K extends ComparableLossKey> {
  readonly useOpportunity: Signal<boolean>;
  readonly comparisons: Signal<OpportunityValueComparison[]>;
  toggleOpportunity(hasOpportunity: boolean): void;
  setModificationValue(itemId: string, value: number): void;
}

export interface OpportunityComparisonConfig<K extends ComparableLossKey> {
  lossKey: K;
  category: ExploreOpportunityCategory;
  displayName: string;
  getValue(item: LossItem<K>): number | undefined;
  withValue(item: LossItem<K>, value: number): LossItem<K>;
}

/**
 * Shared baseline-vs-modification state for a single-field "Explore Opportunities" EEM (e.g. preheat
 * charge material): a toggle, a per-item comparison list, and reset-to-baseline on toggle-off.
 * Parameterized by loss key and a get/set pair for the one field each EEM owns. Call from an
 * injection context (e.g. a component constructor).
 */
export function createOpportunityComparisonState<K extends ComparableLossKey>(
  config: OpportunityComparisonConfig<K>,
): OpportunityComparisonState<K> {
  const assessmentService = inject(ProcessHeatingAssessmentService);
  const modificationService = inject(ModificationService);

  const items = (scenario: AssessmentScenario): LossItem<K>[] =>
    (assessmentService.lossSignal(scenario, config.lossKey) as LossItem<K>[] | undefined) ?? [];

  const useOpportunity: Signal<boolean> = computed(() =>
    modificationService.selectedModification()?.exploreOpportunityFlags?.[config.category]?.hasOpportunity ?? false
  );

  const comparisons: Signal<OpportunityValueComparison[]> = computed(() => {
    const baselineItems = items('baseline');
    const modificationId = modificationService.selectedModificationId();
    const modificationItems = modificationId ? items(modificationId) : [];

    return baselineItems.map(baselineItem => {
      const modificationItem = modificationItems.find(item => item.id === baselineItem.id);
      return {
        id: baselineItem.id,
        name: baselineItem.name,
        baselineValue: config.getValue(baselineItem),
        modificationValue: (modificationItem && config.getValue(modificationItem)) ?? config.getValue(baselineItem),
      };
    });
  });

  function resetToBaseline(modificationId: string): void {
    const modification = modificationService.selectedModification();
    if (!modification) {
      return;
    }

    const baselineItems = items('baseline');
    const effectiveItems = items(modificationId);

    /**
     * Reset only the field this EEM owns; leave any other override (e.g. from Expert View) as is.
     */
    const resetItems = effectiveItems.map(item => {
      const baselineItem = baselineItems.find(candidate => candidate.id === item.id);
      const baselineValue = baselineItem && config.getValue(baselineItem);
      return baselineValue === undefined ? item : config.withValue(item, baselineValue);
    });

    assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      [config.lossKey]: resetItems,
    });
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
     * deselecting has to actively reset the field — otherwise it keeps applying regardless.
     */
    if (!hasOpportunity) {
      resetToBaseline(modificationId);
    }
  }

  function setModificationValue(itemId: string, value: number): void {
    if (Number.isNaN(value)) {
      return;
    }

    const modification = modificationService.selectedModification();
    if (!modification) {
      return;
    }

    /**
     * Start from this modification's effective items, not raw baseline — else editing one item's
     * value discards another item's override.
     */
    const effectiveItems = items(modification.id);
    const updatedItems = effectiveItems.map(item =>
      item.id === itemId ? config.withValue(item, value) : item
    );

    assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      [config.lossKey]: updatedItems,
    });
  }

  return { useOpportunity, comparisons, toggleOpportunity, setModificationValue };
}
