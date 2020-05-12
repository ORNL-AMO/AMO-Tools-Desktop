import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, FacilityCompressorData } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { OperatingCostService } from '../../operating-cost/operating-cost.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { AirLeakService } from '../air-leak.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-air-leak-form',
  templateUrl: './air-leak-form.component.html',
  styleUrls: ['./air-leak-form.component.css']
})
export class AirLeakFormComponent implements OnInit {

  @Output('calculate')
  calculate = new EventEmitter<AirLeakSurveyInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();


  @Input()
  inputs: AirLeakSurveyInput;
  @Input()
  outputs: AirLeakSurveyOutput;
  @Input() 
  inEditMode: boolean = false;
  @Input()
  settings: Settings;
  @Input()
  resetForm: boolean = false;

  showOperatingHoursModal: boolean;
  compressorCustomControl: boolean;
  compressorCustomSpecificPower: boolean;
  formWidth: number;
  leaksTableString: any;
  currentLeakIndex: number;
  currentFlowRate: number;
  currentElectricityUse: number;
  // leak form
  leakForm: FormGroup;
  facilityCompressorDataForm: FormGroup;
  
  @ViewChild('leaksTable', { static: false }) leaksTable: ElementRef;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  utilityTypeOptions: Array<{display: string, value: number}> = [
    {display: 'Compressed Air', value: 0},
    {display: 'Electric', value: 1}
  ];

  measurementMethods: Array<{display: string, value: number}> = [
    {display: 'Estimate', value: 0},
    {display: 'Decibel Method', value: 1},
    {display: 'Bag Method', value: 2},
    {display: 'Orifice Method', value: 3},
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

  constructor(private operatingCostService: OperatingCostService, private airLeakService: AirLeakService) { }

  ngOnInit(): void {
    this.initForms();
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  initForms() {
    this.initLeakForm();
    this.initFacilityCompressorDataForm();
  }

  initFacilityCompressorDataForm() {
    let defaultCompressorData: FacilityCompressorData = this.airLeakService.getFacilityCompressorFormReset();
    this.facilityCompressorDataForm = this.airLeakService.getFacilityCompressorFormFromObj(defaultCompressorData);
    this.inputs.facilityCompressorData = this.getFacilityCompressorDataFormValue();
  }

  initLeakForm() {
    let defaultForm = this.airLeakService.getFormReset();
    this.leakForm = this.airLeakService.getFormFromObj(defaultForm);
  }

  addLeak() {
    let tempForm = this.airLeakService.getObjFromForm(this.leakForm);
    this.inputs.compressedAirLeakSurveyInputVec.push(tempForm);
    this.inputs.facilityCompressorData = this.getFacilityCompressorDataFormValue();
    this.emitChange();
    this.initLeakForm();
    if (this.outputs.leakResults.length >= 1) {
      this.currentLeakIndex = this.outputs.leakResults.length - 1;
    } else {
      this.currentLeakIndex = 0;
    }
  }

  saveLeak() {
    let tempForm: AirLeakSurveyData = this.airLeakService.getObjFromForm(this.leakForm);
    this.inputs.compressedAirLeakSurveyInputVec[this.currentLeakIndex] = tempForm;
    this.inputs.facilityCompressorData = this.getFacilityCompressorDataFormValue();
    this.emitChange();
    this.initLeakForm();
    this.inEditMode = false;
  }

  getFacilityCompressorDataFormValue(): FacilityCompressorData  {
    return {
      hoursPerYear: this.facilityCompressorDataForm.controls.hoursPerYear.value,
      utilityType: this.facilityCompressorDataForm.controls.utilityType.value,
      utilityCost: this.facilityCompressorDataForm.controls.utilityCost.value,
      compressorElectricityData: this.facilityCompressorDataForm.get("compressorElectricityData").value
    }
  }

  editLeak(index: number) {
    this.currentLeakIndex = index;
    this.leakForm = this.airLeakService.getFormFromObj(this.inputs.compressedAirLeakSurveyInputVec[index]);
    this.inEditMode = true;
  }

  copyLeak(index: number) {
    let leakCopy = JSON.parse(JSON.stringify(this.inputs.compressedAirLeakSurveyInputVec[index]));
    leakCopy.name = 'Copy of ' + leakCopy.name;
    this.inputs.compressedAirLeakSurveyInputVec.push(leakCopy);
    this.emitChange();
  }

  deleteLeak(index: number) {
    this.inputs.compressedAirLeakSurveyInputVec.splice(index, 1);
    this.outputs.leakResults.splice(index, 1);
    this.emitChange();
    this.initLeakForm();
    if (this.currentLeakIndex == index) {
      if (index >= 1) {
        this.currentLeakIndex = this.outputs.leakResults.length - 1;
      } else {
        this.currentLeakIndex = 0;
      }
    } else {
      this.currentLeakIndex = this.currentLeakIndex - 1;
    }
    this.inEditMode = false;
  }
  
  emitChange() {
    this.calculate.emit(this.inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  // changeCompressorControl and changeCompressorType from CA-Reduction form may have bugs. 
  //  Specifically assigning to the wrong index?
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
        this.compressorControlTypes[8].adjustment = compressorElectricityForm.controls.compressorControlAdjustment.value;
      }
    }
    this.airLeakService.setCompressorDataValidators(this.facilityCompressorDataForm);
    this.emitChange();
  }

  changeCompressorType() {
    let compressorElectricityForm: FormGroup = (this.facilityCompressorDataForm.get("compressorElectricityData") as FormGroup);
    if (!this.compressorCustomSpecificPower) {
      if (compressorElectricityForm.controls.compressorSpecificPowerControl.value == 4) {
        this.compressorCustomSpecificPower = true;
      }
      compressorElectricityForm.patchValue({ compressorSpecificPower: this.compressorTypes[compressorElectricityForm.controls.compressorSpecificPowerControl.value].specificPower });
    }
    else if (compressorElectricityForm.controls.compressorSpecificPowerControl.value != 4) {
      this.compressorCustomSpecificPower = false;
      compressorElectricityForm.patchValue({ compressorSpecificPower: this.compressorTypes[compressorElectricityForm.controls.compressorSpecificPowerControl.value].specificPower });
    }
    else {
      if (compressorElectricityForm.controls.compressorSpecificPower.value) {
        this.compressorTypes[5].specificPower = compressorElectricityForm.controls.compressorSpecificPower.value;
      }
    }
    this.airLeakService.setCompressorDataValidators(this.facilityCompressorDataForm);
    this.emitChange();
  }
  
  toggleSelected(index: number, selected: boolean) {
    this.inputs.compressedAirLeakSurveyInputVec[index].selected = selected;
    this.emitChange();
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
    this.inputs.compressedAirLeakSurveyInputVec[this.currentLeakIndex].hoursPerYear = oppHours.hoursPerYear;
    this.emitChange();
    this.closeOperatingHoursModal();
  }

  updateLeaksTableString() {
    this.leaksTableString = this.leaksTable.nativeElement.innerText;
  }

  btnResetData() {
    let emptyInputs: AirLeakSurveyInput = this.airLeakService.getDefaultEmptyInputs();
    let emptyOutputs: AirLeakSurveyOutput = this.airLeakService.getDefaultEmptyOutputs();
    this.inputs.compressedAirLeakSurveyInputVec = emptyInputs.compressedAirLeakSurveyInputVec;
    this.outputs.baselineData = emptyOutputs.baselineData;
    this.outputs.leakResults = emptyOutputs.leakResults;
    this.outputs.modificationData = emptyOutputs.modificationData;
    this.outputs.savingsData = emptyOutputs.savingsData;
    this.emitChange();
    this.initLeakForm();
    this.initFacilityCompressorDataForm();
    this.inEditMode = false;
    this.currentLeakIndex = 0;
  }

  btnGenerateExample() {
    let exampleInputs: AirLeakSurveyInput = this.airLeakService.getExample();
    let exampleFacilityData: FacilityCompressorData = this.airLeakService.getExampleFacilityCompressorData();
    this.inputs.compressedAirLeakSurveyInputVec = exampleInputs.compressedAirLeakSurveyInputVec;
    this.inputs.facilityCompressorData = exampleFacilityData;
    this.emitChange();
    this.leakForm = this.airLeakService.getFormFromObj(this.inputs.compressedAirLeakSurveyInputVec[0]);
    this.facilityCompressorDataForm = this.airLeakService.getFacilityCompressorFormFromObj(exampleFacilityData);
    this.currentLeakIndex = 0;
  }

}
