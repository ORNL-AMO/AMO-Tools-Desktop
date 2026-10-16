import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { ExploreOpportunityCategory, PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

export const HEAT_SYSTEM_EFFICIENCY_DISPLAY_NAME = 'Improve Furnace Efficiency';
export const OUT_OF_RANGE_WARNING = 'Value must be greater than 0 and no more than 100.';

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

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunityFlags?.[ExploreOpportunityCategory.EfficiencyData]?.hasOpportunity ?? false
  );

  readonly baselineValue: Signal<number | undefined> = computed(() => this.assessmentService.scenarioPhastSignal('baseline')?.systemEfficiency);

  readonly modificationValue: Signal<number | undefined> = computed(() => this.modification()?.systemEfficiency);

  readonly warning = signal<string | null>(null);

  private readonly modification: Signal<PHAST | undefined> = computed(() => {
    const modificationId = this.modificationService.selectedModificationId();
    return modificationId ? this.assessmentService.scenarioPhastSignal(modificationId) : undefined;
  });

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
      this.warning.set(null);
      this.resetToBaseline(modificationId);
    }
  }

  /** Rejects values outside the baseline form's bounds (greater than 0, at most 100) so they never reach results. */
  setModificationValue(value: number): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (Number.isNaN(value) || !modificationId) {
      return;
    }
    if (value <= 0 || value > 100) {
      this.warning.set(OUT_OF_RANGE_WARNING);
      return;
    }
    this.warning.set(null);
    this.assessmentService.updateModificationProperty(modificationId, 'systemEfficiency', value);
  }

  private resetToBaseline(modificationId: string): void {
    if (this.modificationValue() !== this.baselineValue()) {
      this.assessmentService.updateModificationProperty(modificationId, 'systemEfficiency', this.baselineValue());
    }
  }
}
