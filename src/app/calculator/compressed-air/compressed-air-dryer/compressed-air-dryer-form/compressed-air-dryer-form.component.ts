import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { PurgeInputMode } from '../../../../shared/models/standalone';
import { CompressedAirDryerService } from '../compressed-air-dryer.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { DRYER_TYPE_OPTIONS, DryerTypeConfig, getMinimumPurgeAirRate } from '../compressed-air-dryer-type-config';

@Component({
  selector: 'app-compressed-air-dryer-form',
  templateUrl: './compressed-air-dryer-form.component.html',
  styleUrl: './compressed-air-dryer-form.component.css',
  standalone: false,
})
export class CompressedAirDryerFormComponent implements AfterViewInit {
  @Input() form: UntypedFormGroup;
  @Input() settings: Settings;
  @Input() operatingHours: OperatingHours;
  @Input() idString: string = 'baseline';
  @Output() calculate = new EventEmitter<boolean>();
  @Output() changeField = new EventEmitter<string>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setOpHoursModalWidth();
  }

  dryerTypeOptions = DRYER_TYPE_OPTIONS;
  purgeInputMode = PurgeInputMode;
  showOperatingHoursModal: boolean = false;
  formWidth: number;

  constructor(private compressedAirDryerService: CompressedAirDryerService,
    private convertUnitsService: ConvertUnitsService) { }

  ngAfterViewInit(): void {
    setTimeout(() => this.setOpHoursModalWidth(), 100);
  }

  get typeConfig(): DryerTypeConfig {
    return this.compressedAirDryerService.getTypeConfig(this.form.controls.dryerType.value);
  }

  // Warning when the entered rate is below the electricity-based purge air floor; null when the
  // type has no purge air, inputs are invalid, or the entered rate is at or above the floor.
  get minimumPurgeAirRateWarning(): string | null {
    const controls = this.form.controls;
    if (!controls.purgeInputMode.enabled || controls.costOfElectricity.invalid || controls.costOfCompressedAir.invalid) {
      return null;
    }
    const isImperial = this.settings.unitsOfMeasure === 'Imperial';
    let minimumRate = getMinimumPurgeAirRate(controls.costOfElectricity.value);
    if (!isImperial) {
      minimumRate = this.convertUnitsService.convertDollarPerValue(minimumRate, 'ft3', 'm3');
    }
    if (controls.costOfCompressedAir.value >= minimumRate) {
      return null;
    }
    return `Purge air is priced at $${minimumRate.toFixed(3)}/1000 ${isImperial ? 'SCF' : 'm3'}, the minimum based on your electricity cost. Rates below this are not used.`;
  }

  onFormChange(): void {
    this.calculate.emit(true);
  }

  changeFlowRate(): void {
    this.compressedAirDryerService.validatePurgeFlowRate(this.form);
    this.onFormChange();
  }

  changeDryerType(): void {
    this.compressedAirDryerService.applyTypeDefaults(this.form);
    this.onFormChange();
  }

  // Purge mode and heater/motor auto/manual selections show or hide their value inputs.
  changeMode(valueControlName: string): void {
    this.compressedAirDryerService.setConditionalControls(this.form);
    const valueControl = this.form.controls[valueControlName];
    if (valueControl.enabled) {
      if (valueControl.value === 0) {
        valueControl.patchValue(null, { emitEvent: false });
      }
      valueControl.markAsDirty();
    }
    this.onFormChange();
  }

  focusField(str: string): void {
    this.changeField.emit(str);
  }

  openOperatingHoursModal(): void {
    this.showOperatingHoursModal = true;
  }

  closeOperatingHoursModal(): void {
    this.showOperatingHoursModal = false;
  }

  updateOperatingHours(oppHours: OperatingHours): void {
    this.operatingHours = oppHours;
    this.form.controls.annualOperatingHours.patchValue(oppHours.hoursPerYear);
    this.form.controls.annualOperatingHours.markAsDirty();
    this.onFormChange();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth(): void {
    if (this.formElement?.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
