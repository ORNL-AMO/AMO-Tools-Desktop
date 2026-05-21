import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AirLeakSurveyInput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { OperatingCostService } from '../../operating-cost/operating-cost.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { AirLeakService } from '../air-leak.service';
import { FormGroup } from '@angular/forms';
import { AirLeakFormService } from '../air-leak-form/air-leak-form.service';
import { ConvertAirLeakService } from '../../air-leak-survey/convert-air-leak.service';
import { roundVal } from '../../../../shared/helperFunctions';
import { measurementMethods, CompressorControlType, CompressorSpecificPowerType, FacilityUtilityType } from '../../compressed-air-constants';

@Component({
    selector: 'app-facility-compressor-data-form',
    templateUrl: './facility-compressor-data-form.component.html',
    styleUrls: ['./facility-compressor-data-form.component.css'],
    host: { '(window:resize)': 'onResize($event)' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FacilityCompressorDataFormComponent implements OnInit {

  @Input()
  settings: Settings;

  airLeakInput: AirLeakSurveyInput;

  private destroyRef = inject(DestroyRef);

  annualTotalElectricity: number;
  currentField: string;
  showOperatingHoursModal: boolean;
  compressorCustomControl: boolean;
  compressorCustomSpecificPower: boolean;
  formWidth: number;
  currentElectricityUse: number;
  facilityCompressorDataForm: FormGroup;

  @ViewChild('leaksTable', { static: false }) leaksTable: ElementRef;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  onResize(event: Event) {
    this.setOpHoursModalWidth();
  }

  utilityTypeOptions: Array<{ display: string, value: number }> = [
    { display: 'Compressed Air', value: FacilityUtilityType.CompressedAir },
    { display: 'Electric', value: FacilityUtilityType.Electric }
  ];

  measurementMethods = measurementMethods;

  compressorControlTypes: Array<{ value: number, name: string, adjustment: number }> = [
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
    { value: CompressorControlType.Custom, name: 'Custom', adjustment: 0 }
  ];
  compressorTypes: Array<{ value: number, display: string, specificPower: number }> = [
    { value: CompressorSpecificPowerType.Reciprocating, display: 'Reciprocating', specificPower: 0.16 },
    { value: CompressorSpecificPowerType.RotaryScrewLubricantInjected, display: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: CompressorSpecificPowerType.RotaryScrewLubricantFree, display: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: CompressorSpecificPowerType.Centrifugal, display: 'Centrifugal', specificPower: 0.21 },
    { value: CompressorSpecificPowerType.Custom, display: 'Custom', specificPower: 0.0 }
  ];

  constructor(private operatingCostService: OperatingCostService,
    private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService,
    private convertAirLeakService: ConvertAirLeakService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.setFormFromInputs();
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  setFormFromInputs() {
    this.airLeakInput = this.airLeakService.airLeakInput.getValue();
    this.facilityCompressorDataForm = this.airLeakFormService.getFacilityCompressorFormFromObj(this.airLeakInput.facilityCompressorData);
  }

  initSubscriptions() {
    this.airLeakService.airLeakOutput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.annualTotalElectricity = value.baselineTotal.annualTotalElectricity;
        this.cdr.markForCheck();
      });

    this.airLeakService.generateExample
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (val === true) {
          this.setFormFromInputs();
          this.cdr.markForCheck();
        }
      });

    this.airLeakService.resetData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (val === true) {
          this.setFormFromInputs();
          this.cdr.markForCheck();
        }
      });
  }

  save() {
    this.airLeakInput.facilityCompressorData = this.facilityCompressorDataForm.value
    this.airLeakService.airLeakInput.next(this.airLeakInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

  changeCompressorControl() {
    let compressorElectricityForm: FormGroup = (this.facilityCompressorDataForm.get("compressorElectricityData") as FormGroup);
    if (!this.compressorCustomControl) {
      if (compressorElectricityForm.controls.compressorControl.value === CompressorControlType.Custom) {
        this.compressorCustomControl = true;
      }
      let control = this.compressorControlTypes.find(controlItem => { return controlItem.value === compressorElectricityForm.controls.compressorControl.value });
      compressorElectricityForm.patchValue({ compressorControlAdjustment: control.adjustment });
    }
    else if (compressorElectricityForm.controls.compressorControl.value !== CompressorControlType.Custom) {
      this.compressorCustomControl = false;
      let control = this.compressorControlTypes.find(controlItem => { return controlItem.value == compressorElectricityForm.controls.compressorControl.value });
      compressorElectricityForm.patchValue({ compressorControlAdjustment: control.adjustment });
    }
    else {
      if (compressorElectricityForm.controls.compressorControlAdjustment.valid) {
        const customControl = this.compressorControlTypes.find(c => c.value === CompressorControlType.Custom);
        if (customControl) customControl.adjustment = compressorElectricityForm.controls.compressorControlAdjustment.value;
      }
    }
    this.airLeakFormService.setCompressorDataValidators(this.facilityCompressorDataForm);
    this.save();
  }

  changeCompressorType() {
    let compressorElectricityForm: FormGroup = (this.facilityCompressorDataForm.get("compressorElectricityData") as FormGroup);
    if (!this.compressorCustomSpecificPower) {
      if (compressorElectricityForm.controls.compressorSpecificPowerControl.value === CompressorSpecificPowerType.Custom) {
        this.compressorCustomSpecificPower = true;
      }
      let specificPower: number = this.getSpecificPower(compressorElectricityForm);
      compressorElectricityForm.patchValue({ compressorSpecificPower: specificPower });
    }
    else if (compressorElectricityForm.controls.compressorSpecificPowerControl.value !== CompressorSpecificPowerType.Custom) {
      this.compressorCustomSpecificPower = false;
      let specificPower: number = this.getSpecificPower(compressorElectricityForm);
      compressorElectricityForm.patchValue({ compressorSpecificPower: specificPower });
    }
    else {
      if (compressorElectricityForm.controls.compressorSpecificPower.value) {
        const customType = this.compressorTypes.find(t => t.value === CompressorSpecificPowerType.Custom);
        if (customType) customType.specificPower = compressorElectricityForm.controls.compressorSpecificPower.value;
      }
    }
    this.airLeakFormService.setCompressorDataValidators(this.facilityCompressorDataForm);
    this.save();
  }


  getSpecificPower(compressorElectricityForm: FormGroup): number {
    let specificPower: number = this.compressorTypes[compressorElectricityForm.controls.compressorSpecificPowerControl.value].specificPower;
    if (this.settings.unitsOfMeasure !== 'Imperial') {
      specificPower = this.convertAirLeakService.convertSpecificPowerToMetric(specificPower);
      specificPower = roundVal(specificPower);
    } else {
      //per issue-4091
      specificPower = specificPower * 100;
    }
    return specificPower
  }

  toggleSelected(index: number, selected: boolean) {
    this.airLeakInput.compressedAirLeakSurveyInputVec[index].selected = selected;
    this.save();
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.operatingCostService.operatingHours = oppHours;
    this.facilityCompressorDataForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  changeUtilityType() {
    if (this.facilityCompressorDataForm.controls.utilityType.value === FacilityUtilityType.CompressedAir) {
      this.facilityCompressorDataForm.controls.utilityCost.patchValue(this.settings.compressedAirCost);
    } else {
      this.facilityCompressorDataForm.controls.utilityCost.patchValue(this.settings.electricityCost);
    }
    this.save();
  }
}
