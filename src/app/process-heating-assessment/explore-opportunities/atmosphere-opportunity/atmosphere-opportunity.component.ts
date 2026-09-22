import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, Signal, untracked } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ModificationService } from '../../services/modification.service';
import { AtmosphereLossWarnings, getAtmosphereLossWarnings } from '../../heat-balance/losses/atmosphere/atmosphere-warnings';

const OPPORTUNITY_DISPLAY_NAME = 'Optimize Furnace Atmosphere Makeup System';

type AtmosphereOpportunityValues = Pick<AtmosphereLoss, 'flowRate' | 'inletTemperature' | 'outletTemperature'>;
export type AtmosphereOpportunityField = keyof AtmosphereOpportunityValues;

const SECTION_FIELDS = {
  flowRate: ['flowRate'],
  temperature: ['inletTemperature', 'outletTemperature'],
} as const satisfies Record<string, readonly AtmosphereOpportunityField[]>;

export type AtmosphereOpportunitySection = keyof typeof SECTION_FIELDS;

type ExpandedSections = Record<AtmosphereOpportunitySection, ReadonlySet<string>>;

export interface AtmosphereOpportunityComparison {
  id: string;
  name: string;
  baseline: AtmosphereOpportunityValues;
  modification: AtmosphereOpportunityValues;
  baselineWarnings: AtmosphereLossWarnings;
  modificationWarnings: AtmosphereLossWarnings;
}

/**
 * Hand-written instead of `createOpportunityComparisonState()`: this EEM toggles flow rate and the
 * inlet/outlet temperature pair independently per loss, which the factory's single-field shape can't express.
 */
@Component({
  selector: 'app-atmosphere-opportunity',
  standalone: false,
  templateUrl: './atmosphere-opportunity.component.html',
  styleUrl: './atmosphere-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtmosphereOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunityFlags?.[ExploreOpportunityCategory.Atmosphere]?.hasOpportunity ?? false
  );

  readonly comparisons: Signal<AtmosphereOpportunityComparison[]> = computed(() => {
    const modificationId = this.modificationService.selectedModificationId();
    const modificationItems = modificationId ? this.items(modificationId) : [];

    return this.items('baseline').map(baselineItem => {
      const modificationItem = modificationItems.find(item => item.id === baselineItem.id) ?? baselineItem;
      return {
        id: baselineItem.id,
        name: baselineItem.name,
        baseline: pickValues(baselineItem),
        modification: pickValues(modificationItem),
        baselineWarnings: getAtmosphereLossWarnings(baselineItem),
        modificationWarnings: getAtmosphereLossWarnings(modificationItem),
      };
    });
  });

  /**
   * Seeded per modification from which sections already differ from baseline, then user-driven.
   * Seed reads are untracked so typing a value back to baseline doesn't collapse its section.
   */
  private readonly expandedSections = linkedSignal<string | undefined, ExpandedSections>({
    source: this.modificationService.selectedModificationId,
    computation: () => untracked(() => this.sectionsDifferingFromBaseline()),
  });

  isExpanded(section: AtmosphereOpportunitySection, lossId: string): boolean {
    return this.expandedSections()[section].has(lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.Atmosphere, {
      hasOpportunity,
      display: OPPORTUNITY_DISPLAY_NAME,
    });

    /**
     * The merge no longer gates a loss-type diff on this flag (see scenario-merge.util.ts), so
     * deselecting has to actively reset the fields — otherwise they keep applying regardless.
     */
    if (!hasOpportunity) {
      this.expandedSections.set({ flowRate: new Set(), temperature: new Set() });
      this.resetToBaseline(() => true, [...SECTION_FIELDS.flowRate, ...SECTION_FIELDS.temperature]);
    }
  }

  toggleSection(section: AtmosphereOpportunitySection, lossId: string, show: boolean): void {
    this.expandedSections.update(sections => {
      const ids = new Set(sections[section]);
      if (show) {
        ids.add(lossId);
      } else {
        ids.delete(lossId);
      }
      return { ...sections, [section]: ids };
    });

    if (!show) {
      this.resetToBaseline(item => item.id === lossId, SECTION_FIELDS[section]);
    }
  }

  setModificationValue(lossId: string, field: AtmosphereOpportunityField, value: number): void {
    if (Number.isNaN(value)) {
      return;
    }
    this.writeModificationItems(item => (item.id === lossId ? { ...item, [field]: value } : item));
  }

  private items(scenario: AssessmentScenario): AtmosphereLoss[] {
    return this.assessmentService.lossSignal(scenario, 'atmosphereLosses') ?? [];
  }

  private sectionsDifferingFromBaseline(): ExpandedSections {
    const comparisons = this.comparisons();
    const differing = (section: AtmosphereOpportunitySection) => new Set(
      comparisons
        .filter(comparison => SECTION_FIELDS[section].some(field => comparison.baseline[field] !== comparison.modification[field]))
        .map(comparison => comparison.id)
    );
    return { flowRate: differing('flowRate'), temperature: differing('temperature') };
  }

  private resetToBaseline(shouldReset: (item: AtmosphereLoss) => boolean, fields: readonly AtmosphereOpportunityField[]): void {
    const baselineItems = this.items('baseline');
    this.writeModificationItems(item => {
      const baselineItem = baselineItems.find(candidate => candidate.id === item.id);
      if (!baselineItem || !shouldReset(item)) {
        return item;
      }
      const reset = { ...item };
      fields.forEach(field => reset[field] = baselineItem[field]);
      return reset;
    });
  }

  /**
   * Maps over this modification's effective items, not raw baseline — else editing one item's
   * value discards another item's override.
   */
  private writeModificationItems(mapItem: (item: AtmosphereLoss) => AtmosphereLoss): void {
    const modification = this.modificationService.selectedModification();
    if (!modification) {
      return;
    }
    this.assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      atmosphereLosses: this.items(modification.id).map(mapItem),
    });
  }
}

function pickValues(loss: AtmosphereLoss): AtmosphereOpportunityValues {
  return { flowRate: loss.flowRate, inletTemperature: loss.inletTemperature, outletTemperature: loss.outletTemperature };
}
