import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal, untracked } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ChargeMaterialType } from '../../../models/charge-material';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ChargeMaterialItem, ChargeMaterialService } from './charge-material.service';
import { ChargeMaterialResultsService } from './charge-material-results.service';
import { GasMaterialFormService } from './gas-form/gas-material-form.service';
import { LiquidMaterialFormService } from './liquid-form/liquid-material-form.service';
import { SolidMaterialFormService } from './solid-form/solid-material-form.service';

@Component({
  selector: 'app-charge-material',
  standalone: false,
  templateUrl: './charge-material.component.html',
  styleUrl: './charge-material.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChargeMaterialService,
    ChargeMaterialResultsService,
    SolidMaterialFormService,
    LiquidMaterialFormService,
    GasMaterialFormService,
  ],
})
export class ChargeMaterialComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  readonly chargeMaterialService = inject(ChargeMaterialService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly CMT = ChargeMaterialType;

  readonly resultsUnit: Signal<string> = computed(() => {
    const energyResultUnit = this.settings().energyResultUnit;
    return energyResultUnit === 'kWh' ? 'kW' : `${energyResultUnit}/hr`;
  });

  // Re-initializes whenever `scenario` changes, not just on first render — needed for screens like
  // Expert View where this component could stay mounted while the user switches which
  // modification is selected. initialize() itself reads processHeatingSignal (via scenarioPhast),
  // so its call must be untracked — otherwise this effect would also rerun on every PHAST edit,
  // not just a scenario() change.
  constructor() {
    effect(() => {
      const scenario = this.scenario();
      untracked(() => this.chargeMaterialService.initialize(scenario));
    });
  }

  isCollapsed(item: ChargeMaterialItem): boolean {
    return this.chargeMaterialService.collapsedIds().has(item.id);
  }

  onNameChange(item: ChargeMaterialItem, name: string): void {
    this.chargeMaterialService.setName(item.id, name);
  }

  onTypeChange(item: ChargeMaterialItem, type: string): void {
    this.chargeMaterialService.switchType(item.id, type as ChargeMaterialType);
  }

  addMaterial(): void {
    this.chargeMaterialService.add();
  }

  removeMaterial(item: ChargeMaterialItem): void {
    this.chargeMaterialService.remove(item.id);
  }

  toggleCollapse(item: ChargeMaterialItem): void {
    this.chargeMaterialService.toggleCollapse(item.id);
  }
}
