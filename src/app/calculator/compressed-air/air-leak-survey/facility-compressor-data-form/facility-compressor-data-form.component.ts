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
import { ConvertAirLeakService } from '../convert-air-leak.service';
import { roundVal } from '../../../../shared/helperFunctions';
import { CompressorControlType, CompressorSpecificPowerType, FacilityUtilityType } from '../../compressed-air-constants';

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
    { display: 'Compressed Air', value: FacilityUtilityType.CompressedAir },
    { display: 'Electric', value: FacilityUtilityType.Electric },
  ];

  readonly compressorControlTypes: Array<{ value: number; name: string; adjustment: number }> = [
    { value: CompressorControlType.ScrewInletModulation, name: 'Screw Compressor - Inlet Modulation', adjustment: 30 },
    { value: CompressorControlType.ScrewVariableDisplacement, name: 'Screw Compressor - Variable Displacement', adjustment: 60 },
    { value: CompressorControlType.ScrewVariableSpeedDrives, name: 'Screw Compressor – Variable Speed Drives', adjustment: 97 },
    { value: CompressorControlType.OilInjectedScrewLoadUnloadShort, name: 'Oil Injected Screw - Load/Unload (short cycle)', adjustment: 48 },
    { value: CompressorControlType.OilInjectedScrewLoadUnloadLong, name: 'Oil Injected Screw - Load/Unload (2+ minutes cycle)', adjustment: 68 },
    { value: CompressorControlType.OilFreeScrewLoadUnload, name: 'Oil Free Screw - Load/Unload', adjustment: 73 },
    { value: CompressorControlType.ReciprocatingLoadUnload, name: 'Reciprocating Compressor - Load/Unload', adjustment: 74 },
    { value: CompressorControlType.ReciprocatingOnOff, name: 'Reciprocating Compressor - On/Off', adjustment: 100 },
    { value: CompressorControlType.CentrifugalBlowoff, name: 'Centrifugal Compressor – In blowoff (Venting)', adjustment: 0 },
    { value: CompressorControlType.CentrifugalModulatingIBV, name: 'Centrifugal – Modulating (IBV) in throttle range (Non-Venting)', adjustment: 67 },
    { value: CompressorControlType.CentrifugalModulatingIGV, name: 'Centrifugal– Modulating (IGV) in throttle range (Non-Venting)', adjustment: 86 },
    { value: CompressorControlType.Custom, name: 'Custom', adjustment: 0 },
  ];

  readonly compressorTypes: Array<{ value: number; display: string; specificPower: number }> = [
    { value: CompressorSpecificPowerType.Reciprocating, display: 'Reciprocating', specificPower: 0.16 },
    { value: CompressorSpecificPowerType.RotaryScrewLubricantInjected, display: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: CompressorSpecificPowerType.RotaryScrewLubricantFree, display: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: CompressorSpecificPowerType.Centrifugal, display: 'Centrifugal', specificPower: 0.21 },
    { value: CompressorSpecificPowerType.Custom, display: 'Custom', specificPower: 0.0 },
  ];
  
  private readonly facilityData = computed(() => this.surveyService.airLeakInput()?.facilityCompressorData);
  
  constructor() {
    effect(() => {
      const facilityData = this.facilityData();
      if (facilityData) {
        this.facilityForm = this.formService.buildFacilityCompressorForm(facilityData);
        this.compressorCustomControl = this.facilityForm.controls.compressorElectricityData.controls.compressorControl.value === CompressorControlType.Custom;
        this.compressorCustomSpecificPower = this.facilityForm.controls.compressorElectricityData.controls.compressorSpecificPowerControl.value === CompressorSpecificPowerType.Custom;
      }
    });
  }

  ngOnInit(): void {
    const input = this.surveyService.airLeakInput();
    if (input) {
      this.facilityForm = this.formService.buildFacilityCompressorForm(input.facilityCompressorData);
      this.compressorCustomControl = this.facilityForm.controls.compressorElectricityData.controls.compressorControl.value === CompressorControlType.Custom;
      this.compressorCustomSpecificPower = this.facilityForm.controls.compressorElectricityData.controls.compressorSpecificPowerControl.value === CompressorSpecificPowerType.Custom;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setOpHoursModalWidth(), 100);
  }

  onResize(): void {
    this.setOpHoursModalWidth();
  }

  save(): void {
    const current = this.surveyService.airLeakInput();
    if (!current) return;
    this.surveyService.airLeakInput.set({ ...current, facilityCompressorData: this.facilityForm.getRawValue() });
  }

  changeField(field: string): void {
    this.surveyService.currentField.set(field);
  }

  changeCompressorControl(): void {
    const elec = this.facilityForm.controls.compressorElectricityData;
    if (!this.compressorCustomControl) {
      if (elec.controls.compressorControl.value === CompressorControlType.Custom) {
        this.compressorCustomControl = true;
      }
      const ctrl = this.compressorControlTypes.find(c => c.value === elec.controls.compressorControl.value);
      if (ctrl) elec.patchValue({ compressorControlAdjustment: ctrl.adjustment });
    } else if (elec.controls.compressorControl.value !== CompressorControlType.Custom) {
      this.compressorCustomControl = false;
      const ctrl = this.compressorControlTypes.find(c => c.value === elec.controls.compressorControl.value);
      if (ctrl) elec.patchValue({ compressorControlAdjustment: ctrl.adjustment });
    } else if (elec.controls.compressorControlAdjustment.valid) {
      const customControl = this.compressorControlTypes.find(control => control.value === CompressorControlType.Custom);
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
      if (elec.controls.compressorSpecificPowerControl.value === CompressorSpecificPowerType.Custom) {
        this.compressorCustomSpecificPower = true;
      }
      elec.patchValue({ compressorSpecificPower: this.getSpecificPower() });
    } else if (elec.controls.compressorSpecificPowerControl.value !== CompressorSpecificPowerType.Custom) {
      this.compressorCustomSpecificPower = false;
      elec.patchValue({ compressorSpecificPower: this.getSpecificPower() });
    } else if (elec.controls.compressorSpecificPower.value) {
      const customType = this.compressorTypes.find(t => t.value === CompressorSpecificPowerType.Custom);
      if (customType) customType.specificPower = elec.controls.compressorSpecificPower.value;
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
    const utilityCost = this.facilityForm.controls.utilityType.value === FacilityUtilityType.CompressedAir
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
