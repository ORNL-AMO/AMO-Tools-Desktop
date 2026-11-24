import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal, untracked } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { ELECTROTECHNOLOGY_FURNACE_TYPES } from '../../../settings/phast-settings/electrotechnology-furnace-types';
import {
  buildEnergySourceChangeDialogData, EnergySourceChangeDialogComponent, EnergySourceChangeDialogData,
} from '../../assessment-settings/energy-source-change-dialog/energy-source-change-dialog.component';
import { ROUTE_TOKENS } from '../../constants/process-heating-routes';
import { ENERGY_SOURCE_TYPE_OPTIONS } from '../../models/energy-source';
import { getModificationName } from '../../models/modification';
import { EXPERT_VIEW_LOSS_VIEWS, getEnergySourceTabChanges, LossView } from '../../models/views';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { AssessmentScenario, deriveHeatingEquipmentConfiguration } from '../../services/scenario-settings.util';

interface FuelSwitchingForm {
  energySourceType: FormControl<string>;
  furnaceType: FormControl<string | null>;
  customFurnaceName: FormControl<string | null>;
}

/** Energy source of one Expert View scenario: read-only for the baseline, editable for a modification. */
@Component({
  selector: 'app-fuel-switching',
  standalone: false,
  templateUrl: './fuel-switching.component.html',
  styleUrl: './fuel-switching.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelSwitchingComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly ENERGY_SOURCE_TYPE_OPTIONS = ENERGY_SOURCE_TYPE_OPTIONS;
  readonly ELECTROTECHNOLOGY_FURNACE_TYPES = ELECTROTECHNOLOGY_FURNACE_TYPES;
  readonly assessmentSettingsLink = ['../..', ROUTE_TOKENS.baseline, ROUTE_TOKENS.assessmentSettings];

  readonly isBaseline: Signal<boolean> = computed(() => this.scenario() === 'baseline');
  private readonly settings: Signal<Settings> = computed(() => this.assessmentService.scenarioSettings(this.scenario()));

  readonly form = new FormGroup<FuelSwitchingForm>({
    energySourceType: new FormControl<string>('Fuel', { nonNullable: true }),
    furnaceType: new FormControl<string | null>(null),
    customFurnaceName: new FormControl<string | null>(null),
  });

  constructor() {
    effect(() => {
      const settings = this.settings();
      const isBaseline = this.isBaseline();
      untracked(() => {
        this.resetForm(settings);
        if (isBaseline) {
          this.form.disable({ emitEvent: false });
        } else {
          this.form.enable({ emitEvent: false });
        }
      });
    });
  }

  /** Mirrors the settings screen: Electrotechnology starts on the first furnace type, the others have none. */
  changeEnergySourceType(): Promise<void> {
    const isElectricity = this.form.controls.energySourceType.value === 'Electricity';
    this.form.controls.furnaceType.setValue(isElectricity ? ELECTROTECHNOLOGY_FURNACE_TYPES[0] : null);
    return this.save();
  }

  /** Confirms first when the change switches the heating equipment configuration; cancelling restores the form. */
  async save(): Promise<void> {
    const scenario = this.scenario();
    const current = this.settings();
    const { energySourceType, furnaceType, customFurnaceName } = this.form.getRawValue();
    const next: Settings = { ...current, energySourceType, furnaceType, customFurnaceName };
    const from = deriveHeatingEquipmentConfiguration(current);
    const to = deriveHeatingEquipmentConfiguration(next);
    if (from !== to && !await this.confirmChange(current, next)) {
      this.resetForm(current);
      return;
    }
    this.modificationService.setEnergySource(scenario, { energySourceType, furnaceType, customFurnaceName });
    if (from !== to) {
      // Operations holds the cost for the new energy source
      const added = getEnergySourceTabChanges(from, to).added.map(link => link.view).filter(view => EXPERT_VIEW_LOSS_VIEWS.has(view));
      this.uiService.markTabsToVisit(scenario, [LossView.OPERATIONS, ...added]);
    }
  }

  private async confirmChange(current: Settings, next: Settings): Promise<boolean> {
    const modification = this.modificationService.modifications().find(candidate => candidate.id === this.scenario());
    const dialogRef = this.modalDialogService.openModal<boolean, EnergySourceChangeDialogData, EnergySourceChangeDialogComponent>(
      EnergySourceChangeDialogComponent, {
        data: buildEnergySourceChangeDialogData({ scenarioName: modification ? getModificationName(modification) : 'Modification', current, next }),
      },
    );
    return (await firstValueFrom(dialogRef.closed)) === true;
  }

  private resetForm(settings: Settings): void {
    this.form.reset({
      energySourceType: settings.energySourceType,
      furnaceType: settings.furnaceType ?? null,
      customFurnaceName: settings.customFurnaceName ?? null,
    }, { emitEvent: false });
  }
}
