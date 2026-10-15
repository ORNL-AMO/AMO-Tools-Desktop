import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ExploreOpportunityCategory, PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

export const HEAT_SYSTEM_EFFICIENCY_DISPLAY_NAME = 'Improve Furnace Efficiency';

const OUT_OF_RANGE_WARNING = 'System efficiency must be greater than 0 and no more than 100. The entered value is not applied.';

@Component({
  selector: 'app-heat-system-efficiency-opportunity',
  standalone: false,
  templateUrl: './heat-system-efficiency-opportunity.component.html',
  styleUrl: './heat-system-efficiency-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatSystemEfficiencyOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);

  readonly displayName = HEAT_SYSTEM_EFFICIENCY_DISPLAY_NAME;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunityFlags?.[ExploreOpportunityCategory.EfficiencyData]?.hasOpportunity ?? false
  );

  private readonly baseline: Signal<PHAST | undefined> = computed(() => this.assessmentService.scenarioPhastSignal('baseline'));

  private readonly modification: Signal<PHAST | undefined> = computed(() => {
    const modificationId = this.modificationService.selectedModificationId();
    return modificationId ? this.assessmentService.scenarioPhastSignal(modificationId) : undefined;
  });

  readonly baselineValue: Signal<number | undefined> = computed(() => this.baseline()?.systemEfficiency);
  readonly modificationValue: Signal<number | undefined> = computed(() => this.modification()?.systemEfficiency);

  /** True when the last entry was out of range and not saved; cleared when the modification changes. */
  private readonly rejected = linkedSignal<string | undefined, boolean>({
    source: this.modificationService.selectedModificationId,
    computation: () => false,
  });

  readonly warning: Signal<string | null> = computed(() => this.rejected() ? OUT_OF_RANGE_WARNING : null);

  toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.EfficiencyData, {
      hasOpportunity,
      display: HEAT_SYSTEM_EFFICIENCY_DISPLAY_NAME,
    });
    if (!hasOpportunity) {
      this.rejected.set(false);
      this.resetToBaseline();
    }
  }

  setModificationValue(systemEfficiency: number): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (Number.isNaN(systemEfficiency) || !modificationId) {
      return;
    }
    const withinBounds = systemEfficiency > 0 && systemEfficiency <= 100;
    this.rejected.set(!withinBounds);
    if (withinBounds) {
      this.assessmentService.updateModificationProperty(modificationId, 'systemEfficiency', systemEfficiency);
    }
  }

  private resetToBaseline(): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (modificationId && this.baselineValue() !== this.modificationValue()) {
      this.assessmentService.updateModificationProperty(modificationId, 'systemEfficiency', this.baselineValue());
    }
  }
}
