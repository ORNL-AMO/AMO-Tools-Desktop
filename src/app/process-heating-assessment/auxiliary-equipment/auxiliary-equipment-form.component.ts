import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { generateFormControlIds } from '../../shared/helperFunctions';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { MultimeterReadingData, NameplateData } from '../../shared/models/standalone';
import { Settings } from '../../shared/models/settings';
import { LossFieldDifferences, nestedDifferences } from '../heat-balance/losses/loss-compare.util';
import { AUXILIARY_EQUIPMENT_MEASUREMENT_METHOD_LABELS, AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { AuxiliaryEquipmentFormItem } from './auxiliary-equipment.service';

const MEASUREMENT_METHOD_OPTIONS = Object.values(AuxiliaryEquipmentMeasurementMethod).map(value => ({
  value,
  label: AUXILIARY_EQUIPMENT_MEASUREMENT_METHOD_LABELS[value],
}));

@Component({
  selector: 'app-auxiliary-equipment-form',
  standalone: false,
  templateUrl: './auxiliary-equipment-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuxiliaryEquipmentFormComponent {
  readonly item = input.required<AuxiliaryEquipmentFormItem>();
  readonly settings = input.required<Settings>();
  readonly differingFields = input<LossFieldDifferences<AuxiliaryEquipmentItem>>();

  private readonly uiService = inject(ProcessHeatingUiService);

  readonly MeasurementMethod = AuxiliaryEquipmentMeasurementMethod;
  readonly measurementMethodOptions = MEASUREMENT_METHOD_OPTIONS;

  readonly form = computed(() => this.item().form);
  readonly multimeter = computed(() => this.form().controls.multimeterData.controls);
  readonly nameplate = computed(() => this.form().controls.nameplateData.controls);
  readonly controlIds = computed(() => generateFormControlIds({
    ...this.form().controls,
    ...this.multimeter(),
    ...this.nameplate(),
    ...this.form().controls.powerMeterData.controls,
    ...this.form().controls.otherMethodData.controls,
  }));
  readonly multimeterDifferences = computed(() => nestedDifferences<MultimeterReadingData>(this.differingFields(), 'multimeterData'));
  readonly nameplateDifferences = computed(() => nestedDifferences<NameplateData>(this.differingFields(), 'nameplateData'));

  setNumberOfPhases(phases: number): void {
    this.multimeter().numberOfPhases.setValue(phases);
  }

  toggleUserSelectedHP(): void {
    const control = this.form().controls.userSelectedHP;
    control.setValue(!control.value);
  }

  focusField(field: string): void {
    this.uiService.focusedFieldSignal.set(field);
  }
}
