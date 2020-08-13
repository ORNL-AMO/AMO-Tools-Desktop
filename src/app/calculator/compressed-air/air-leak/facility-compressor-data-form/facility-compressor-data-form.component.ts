import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AirLeakSurveyInput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { OperatingCostService } from '../../operating-cost/operating-cost.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { AirLeakService } from '../air-leak.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AirLeakFormService } from '../air-leak-form/air-leak-form.service';
import { ConvertAirLeakService } from '../convert-air-leak.service';

@Component({
  selector: 'app-facility-compressor-data-form',
  templateUrl: './facility-compressor-data-form.component.html',
  styleUrls: ['./facility-compressor-data-form.component.css']
})
export class FacilityCompressorDataFormComponent implements OnInit {

  @Input()
  settings: Settings;

  airLeakInput: AirLeakSurveyInput;

  airLeakOutputSub: Subscription;
  generateExampleSub: Subscription;
  resetDataSub: Subscription;

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
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  utilityTypeOptions: Array<{ display: string, value: number }> = [
    { display: 'Compressed Air', value: 0 },
    { display: 'Electric', value: 1 }
  ];

  measurementMethods: Array<{ display: string, value: number }> = [
    { display: 'Estimate', value: 0 },
    { display: 'Decibel Method', value: 1 },
    { display: 'Bag Method', value: 2 },
    { display: 'Orifice Method', value: 3 },
  ];

  compressorControlTypes: Array<{ value: number, display: string, adjustment: number }> = [
    { value: 0, display: 'Modulation (Poor)', adjustment: 25 },
    { value: 1, display: 'Load-Unload (Short-Cycle)', adjustment: 40 },
    { value: 2, display: 'Load-Unload (2+ Minute Cycle)', adjustment: 75 },
    { value: 3, display: 'Centrifugal (Venting)', adjustment: 0 },
    { value: 4, display: 'Centrifugal (Non-Venting)', adjustment: 75 },
    { value: 5, display: 'Reciprocrating Unloaders', adjustment: 80 },
    { value: 6, display: 'Variable Speed', adjustment: 60 },
    { value: 7, display: 'Variable Displacement', adjustment: 60 },
    { value: 8, display: 'Custom', adjustment: 0 }
  ];
  compressorTypes: Array<{ value: number, display: string, specificPower: number }> = [
    { value: 0, display: 'Reciprocating', specificPower: 0.16 },
    { value: 1, display: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: 2, display: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: 3, display: 'Centrifugal', specificPower: 0.21 },
    { value: 4, display: 'Custom', specificPower: 0.0 }
  ];

  constructor(private operatingCostService: OperatingCostService,
    private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService,
    private convertAirLeakService: ConvertAirLeakService) { }

  ngOnInit(): void {
    this.setFormFromInputs();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.airLeakOutputSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.resetDataSub.unsubscribe();
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
    this.airLeakOutputSub = this.airLeakService.airLeakOutput.subscribe(value => {
      this.annualTotalElectricity = value.baselineData.annualTotalElectricity;
    });

    this.generateExampleSub = this.airLeakService.generateExample.subscribe(val => {
      if (val == true) {
        this.setFormFromInputs();
      }
    });

    this.resetDataSub = this.airLeakService.resetData.subscribe(val => {
      if (val == true) {
        this.setFormFromInputs();
      }
    })
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
      if (compressorElectricityForm.controls.compressorControl.value == 8) {
        this.compressorCustomControl = true;
      }
      compressorElectricityForm.patchValue({ compressorControlAdjustment: this.compressorControlTypes[compressorElectricityForm.controls.compressorControl.value].adjustment });
    }
    else if (compressorElectricityForm.controls.compressorControl.value !== 8) {
      this.compressorCustomControl = false;
      compressorElectricityForm.patchValue({ compressorControlAdjustment: this.compressorControlTypes[compressorElectricityForm.controls.compressorControl.value].adjustment });
    }
    else {
      if (compressorElectricityForm.controls.compressorControlAdjustment.valid) {
        this.compressorControlTypes[7].adjustment = compressorElectricityForm.controls.compressorControlAdjustment.value;
      }
    }
    this.airLeakFormService.setCompressorDataValidators(this.facilityCompressorDataForm);
    this.save();
  }

  changeCompressorType() {
    let compressorElectricityForm: FormGroup = (this.facilityCompressorDataForm.get("compressorElectricityData") as FormGroup);
    if (!this.compressorCustomSpecificPower) {
      if (compressorElectricityForm.controls.compressorSpecificPowerControl.value == 4) {
        this.compressorCustomSpecificPower = true;
      }
      let specificPower: number = this.compressorTypes[compressorElectricityForm.controls.compressorSpecificPowerControl.value].specificPower;
      if (this.settings.unitsOfMeasure != 'Imperial') {
        specificPower = this.convertAirLeakService.convertSpecificPower(specificPower);
        specificPower = this.convertAirLeakService.roundVal(specificPower);
      }
      compressorElectricityForm.patchValue({ compressorSpecificPower: specificPower });
    }
    else if (compressorElectricityForm.controls.compressorSpecificPowerControl.value != 4) {
      this.compressorCustomSpecificPower = false;
      let specificPower: number = this.compressorTypes[compressorElectricityForm.controls.compressorSpecificPowerControl.value].specificPower;
      if (this.settings.unitsOfMeasure != 'Imperial') {
        specificPower = this.convertAirLeakService.convertSpecificPower(specificPower);
        specificPower = this.convertAirLeakService.roundVal(specificPower);
      }
      compressorElectricityForm.patchValue({ compressorSpecificPower: specificPower });
    }
    else {
      if (compressorElectricityForm.controls.compressorSpecificPower.value) {
        this.compressorTypes[4].specificPower = compressorElectricityForm.controls.compressorSpecificPower.value;
      }
    }
    this.airLeakFormService.setCompressorDataValidators(this.facilityCompressorDataForm);
    this.save();
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
    this.airLeakInput.facilityCompressorData.hoursPerYear = oppHours.hoursPerYear;
    this.save();
    this.closeOperatingHoursModal();
  }

  changeUtilityType() {
    if (this.facilityCompressorDataForm.controls.utilityType.value == 0) {
      this.facilityCompressorDataForm.controls.utilityCost.patchValue(this.settings.compressedAirCost);
    } else {
      this.facilityCompressorDataForm.controls.utilityCost.patchValue(this.settings.electricityCost);
    }
    this.save();
  }
}
