import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputForm, EnergyInputFormService } from './energy-input-form.service';
import { EnergyInputItem } from './energy-input.service';

@Component({
  selector: 'app-energy-input-form',
  standalone: false,
  templateUrl: './energy-input-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergyInputFormComponent {
  readonly item = input.required<EnergyInputItem>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(EnergyInputFormService);

  readonly form = computed(() => this.item().form as EnergyInputForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
  readonly showFlowRate = signal(false);

  toggleFlowRate(): void {
    this.showFlowRate.update(show => !show);
  }

  setHeatInputFromFlowRate(): void {
    const flowRate = this.form().controls.flowRateInput.value;
    if (flowRate != null) {
      this.form().controls.naturalGasHeatInput.setValue(this.formService.calculateHeatInputFromFlowRate(flowRate, this.settings()));
    }
  }
}
