import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ConvertFanAnalysisService } from '../../../../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { FanMetricDefaults } from '../../../../settings/settings.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasMoistureModalService } from '../../../../shared/flue-gas-moisture-modal/flue-gas-moisture-modal.service';

export interface FlueGasMoistureDialogData {
  settings: Settings;
}

/** CDK dialog host for the moisture calculator. Closes with the moisture percent, or undefined on cancel. */
@Component({
  selector: 'app-flue-gas-moisture-dialog',
  standalone: false,
  template: `<app-flue-gas-moisture-modal [settings]="settings" (hideModal)="dialogRef.close($event)"></app-flue-gas-moisture-modal>`,
  // Per-open instance: the root-provided service otherwise carries inputs between sessions
  providers: [FlueGasMoistureModalService, ConvertFanAnalysisService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlueGasMoistureDialogComponent {
  private readonly moistureModalService = inject(FlueGasMoistureModalService);
  private readonly convertFanAnalysisService = inject(ConvertFanAnalysisService);
  protected readonly dialogRef = inject<DialogRef<number>>(DialogRef<number>);
  // Copy because the calculator mutates the unit fields of the settings it receives
  protected readonly settings: Settings = { ...inject<FlueGasMoistureDialogData>(DIALOG_DATA).settings };

  constructor() {
    if (this.settings.unitsOfMeasure !== 'Imperial') {
      this.seedMetricDefaults();
    }
  }

  /** The calculator's service defaults are Imperial values, so they must be converted before the Metric fan units apply. */
  private seedMetricDefaults(): void {
    this.settings.densityMeasurement = FanMetricDefaults.densityMeasurement;
    this.settings.fanPressureMeasurement = FanMetricDefaults.fanPressureMeasurement;
    this.settings.fanBarometricPressure = FanMetricDefaults.fanBarometricPressure;
    this.moistureModalService.baseGasDensity = this.convertFanAnalysisService.convertBaseGasDensityDefaults(this.moistureModalService.baseGasDensity, this.settings);
  }
}
