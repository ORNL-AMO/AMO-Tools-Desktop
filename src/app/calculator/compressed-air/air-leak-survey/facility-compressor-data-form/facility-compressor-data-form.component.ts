import {
  Component, ChangeDetectionStrategy, OnInit, AfterViewInit,
  ViewChild, ElementRef, inject, effect, computed, input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { OperatingCostService } from '../../operating-cost/operating-cost.service';
import { AirLeakSurveyService } from '../air-leak-survey.service';
import { AirLeakSurveyFormService, FacilityCompressorFormControls } from '../air-leak-survey-form/air-leak-survey-form.service';
import { ConvertAirLeakService } from '../../air-leak/convert-air-leak.service';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-survey-facility-compressor-data-form',
  templateUrl: './facility-compressor-data-form.component.html',
  styleUrls: ['./facility-compressor-data-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
  standalone: false,
})
export class SurveyFacilityCompressorDataFormComponent implements OnInit, AfterViewInit {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(AirLeakSurveyService);
  private readonly formService = inject(AirLeakSurveyFormService);
  private readonly convertAirLeakService = inject(ConvertAirLeakService);
  private readonly operatingCostService = inject(OperatingCostService);

  facilityForm!: FormGroup<FacilityCompressorFormControls>;
  compressorCustomControl = false;
  compressorCustomSpecificPower = false;
  showOperatingHoursModal = false;
  formWidth = 0;

  @ViewChild('formElement') formElement!: ElementRef;

  
  readonly utilityTypeOptions: Array<{ display: string; value: number }> = [
    { display: 'Compressed Air', value: 0 },
    { display: 'Electric', value: 1 },
  ];
  
  readonly compressorControlTypes: Array<{ value: number; name: string; adjustment: number }> = [
    { value: 100, name: 'Screw Compressor - Inlet Modulation', adjustment: 30 },
    { value: 101, name: 'Screw Compressor - Variable Displacement', adjustment: 60 },
    { value: 102, name: 'Screw Compressor – Variable Speed Drives', adjustment: 97 },
    { value: 103, name: 'Oil Injected Screw - Load/Unload (short cycle)', adjustment: 48 },
    { value: 104, name: 'Oil Injected Screw - Load/Unload (2+ minutes cycle)', adjustment: 68 },
    { value: 105, name: 'Oil Free Screw - Load/Unload', adjustment: 73 },
    { value: 106, name: 'Reciprocating Compressor - Load/Unload', adjustment: 74 },
    { value: 107, name: 'Reciprocating Compressor - On/Off', adjustment: 100 },
    { value: 108, name: 'Centrifugal Compressor – In blowoff (Venting)', adjustment: 0 },
    { value: 109, name: 'Centrifugal – Modulating (IBV) in throttle range (Non-Venting)', adjustment: 67 },
    { value: 110, name: 'Centrifugal– Modulating (IGV) in throttle range (Non-Venting)', adjustment: 86 },
    { value: 8, name: 'Custom', adjustment: 0 },
  ];

  readonly compressorTypes: Array<{ value: number; display: string; specificPower: number }> = [
    { value: 0, display: 'Reciprocating', specificPower: 0.16 },
    { value: 1, display: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: 2, display: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: 3, display: 'Centrifugal', specificPower: 0.21 },
    { value: 4, display: 'Custom', specificPower: 0.0 },
  ];
  
  private readonly facilityData = computed(() => this.surveyService.input()?.facilityCompressorData);
  
  constructor() {
    effect(() => {
      const facilityData = this.facilityData();
      if (facilityData) {
        this.facilityForm = this.formService.buildFacilityCompressorForm(facilityData);
        this.compressorCustomControl = this.facilityForm.controls.compressorElectricityData.controls.compressorControl.value === 8;
        this.compressorCustomSpecificPower = this.facilityForm.controls.compressorElectricityData.controls.compressorSpecificPowerControl.value === 4;
      }
    });
  }

  ngOnInit(): void {
    const input = this.surveyService.input();
    if (input) {
      this.facilityForm = this.formService.buildFacilityCompressorForm(input.facilityCompressorData);
      this.compressorCustomControl = this.facilityForm.controls.compressorElectricityData.controls.compressorControl.value === 8;
      this.compressorCustomSpecificPower = this.facilityForm.controls.compressorElectricityData.controls.compressorSpecificPowerControl.value === 4;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setOpHoursModalWidth(), 100);
  }

  onResize(): void {
    this.setOpHoursModalWidth();
  }

  save(): void {
    const current = this.surveyService.input();
    if (!current) return;
    this.surveyService.input.set({ ...current, facilityCompressorData: this.facilityForm.getRawValue() });
  }

  changeField(field: string): void {
    this.surveyService.currentField.set(field);
  }

  changeCompressorControl(): void {
    const elec = this.facilityForm.controls.compressorElectricityData;
    if (!this.compressorCustomControl) {
      if (elec.controls.compressorControl.value === 8) {
        this.compressorCustomControl = true;
      }
      const ctrl = this.compressorControlTypes.find(c => c.value === elec.controls.compressorControl.value);
      if (ctrl) elec.patchValue({ compressorControlAdjustment: ctrl.adjustment });
    } else if (elec.controls.compressorControl.value !== 8) {
      this.compressorCustomControl = false;
      const ctrl = this.compressorControlTypes.find(c => c.value === elec.controls.compressorControl.value);
      if (ctrl) elec.patchValue({ compressorControlAdjustment: ctrl.adjustment });
    } else if (elec.controls.compressorControlAdjustment.valid) {
      const customControl = this.compressorControlTypes.find(control => control.value === 8);
      if (customControl) {
        customControl.adjustment = elec.controls.compressorControlAdjustment.value ?? 0;
      }
    }
    this.formService.applyCompressorValidators(this.facilityForm);
    this.save();
  }

  changeCompressorType(): void {
    const elec = this.facilityForm.controls.compressorElectricityData;
    if (!this.compressorCustomSpecificPower) {
      if (elec.controls.compressorSpecificPowerControl.value === 4) {
        this.compressorCustomSpecificPower = true;
      }
      elec.patchValue({ compressorSpecificPower: this.getSpecificPower() });
    } else if (elec.controls.compressorSpecificPowerControl.value !== 4) {
      this.compressorCustomSpecificPower = false;
      elec.patchValue({ compressorSpecificPower: this.getSpecificPower() });
    } else if (elec.controls.compressorSpecificPower.value) {
      this.compressorTypes[4].specificPower = elec.controls.compressorSpecificPower.value;
    }
    this.formService.applyCompressorValidators(this.facilityForm);
    this.save();
  }

  private getSpecificPower(): number {
    const elec = this.facilityForm.controls.compressorElectricityData;
    let specificPower = this.compressorTypes[elec.controls.compressorSpecificPowerControl.value ?? 0].specificPower;
    if (this.settings().unitsOfMeasure !== 'Imperial') {
      specificPower = roundVal(this.convertAirLeakService.convertSpecificPowerToMetric(specificPower));
    } else {
      specificPower = specificPower * 100;
    }
    return specificPower;
  }

  changeUtilityType(): void {
    const utilityCost = this.facilityForm.controls.utilityType.value === 0
      ? this.settings().compressedAirCost
      : this.settings().electricityCost;
    this.facilityForm.controls.utilityCost.patchValue(utilityCost ?? 0);
    this.save();
  }

  openOperatingHoursModal(): void {
    this.showOperatingHoursModal = true;
  }

  closeOperatingHoursModal(): void {
    this.showOperatingHoursModal = false;
  }

  updateOperatingHours(oppHours: OperatingHours): void {
    this.operatingCostService.operatingHours = oppHours;
    this.facilityForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  private setOpHoursModalWidth(): void {
    if (this.formElement?.nativeElement?.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
