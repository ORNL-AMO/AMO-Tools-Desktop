import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirReductionService } from '../compressed-air-reduction.service';
import { CompressedAirReductionResult, CompressedAirReductionData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-compressed-air-reduction-form',
  templateUrl: './compressed-air-reduction-form.component.html',
  styleUrls: ['./compressed-air-reduction-form.component.css']
})
export class CompressedAirReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: CompressedAirReductionData;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<CompressedAirReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  selected: boolean;
  @Input()
  utilityType: number;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Flow Meter' },
    { value: 1, name: 'Bag Method' },
    { value: 2, name: 'Orifice / Pressure Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  utilityTypes: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Compressed Air' },
    { value: 1, name: 'Electricity' }
  ];
  nozzleTypes: Array<{ value: number, name: string }> = [
    { value: 0, name: '1.0 mm nozzle' },
    { value: 1, name: '1.5 mm nozzle' },
    { value: 2, name: '1/4" pipe, open' },
    { value: 3, name: '1/4" tubing' },
    { value: 4, name: '1/8" pipe, open' },
    { value: 5, name: '1/8" tubing' },
    { value: 6, name: '2.0 mm nozzle' },
    { value: 7, name: '2.5 mm nozzle' },
    { value: 8, name: '3/8" pipe, open' },
    { value: 9, name: '3/8" tubing' },
    { value: 10, name: '5/16" tubing' },
    { value: 11, name: 'Blue Air Knife' },
    { value: 12, name: 'Yellow Air Knife' }
  ];
  compressorControls: Array<{ value: number, name: string, adjustment: number }> = [
    { value: 0, name: 'Modulation (Poor)', adjustment: 25 },
    { value: 1, name: 'Load-Unload (Short-Cycle)', adjustment: 40 },
    { value: 2, name: 'Load-Unload (2+ Minute Cycle)', adjustment: 75 },
    { value: 3, name: 'Centrifugal (Venting)', adjustment: 0 },
    { value: 4, name: 'Centrifugal (Non-Venting)', adjustment: 75 },
    { value: 5, name: 'Reciprocrating Unloaders', adjustment: 80 },
    { value: 6, name: 'Variable Speed', adjustment: 60 },
    { value: 7, name: 'Variable Displacement', adjustment: 60 },
    { value: 8, name: 'Custom', adjustment: 0 }
  ];
  compressorSpecificPowerControls: Array<{ value: number, name: string, specificPower: number }> = [
    { value: 0, name: 'Reciprocating', specificPower: 0.16 },
    { value: 1, name: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: 2, name: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: 3, name: 'Centrifugal', specificPower: 0.21 },
    { value: 4, name: 'Custom', specificPower: 0.0 }
  ];

  compressorCustomControl: boolean = false;
  compressorCustomSpecificPower: boolean = false;
  form: FormGroup;
  idString: string;
  individualResults: CompressedAirReductionResult;
  isEditingName: boolean = false;
  constructor(private compressedAirReductionService: CompressedAirReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.compressedAirReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
    if (this.selected == false) {
      this.form.disable();
    }
    this.calculateIndividualResult();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.utilityType && !changes.utilityType.firstChange) {
      this.form.patchValue({ utilityType: this.utilityType });
    }
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (this.index != 0 || !this.isBaseline) {
          this.form.controls.utilityType.disable();
        }
      }
    }
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  changeCompressorType() {
    if (!this.compressorCustomSpecificPower) {
      if (this.form.controls.compressorSpecificPowerControl.value == 4) {
        this.compressorCustomSpecificPower = true;
        this.form.patchValue({ compressorSpecificPower: this.compressorSpecificPowerControls[this.form.controls.compressorSpecificPowerControl.value].specificPower });
      }
      else {
        this.form.patchValue({ compressorSpecificPower: this.compressorSpecificPowerControls[this.form.controls.compressorSpecificPowerControl.value].specificPower });
      }
    }
    else if (this.form.controls.compressorSpecificPowerControl.value != 4) {
      this.compressorCustomSpecificPower = false;
      this.form.patchValue({ compressorSpecificPower: this.compressorSpecificPowerControls[this.form.controls.compressorSpecificPowerControl.value].specificPower });
    }
    else {
      if (this.form.controls.compressorSpecificPower.value) {
        this.compressorSpecificPowerControls[4].specificPower = this.form.controls.compressorSpecificPower.value;
      }
    }
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  changeCompressorControl() {
    if (!this.compressorCustomControl) {
      if (this.form.controls.compressorControl.value == 8) {
        this.compressorCustomControl = true;
        this.form.patchValue({ compressorControlAdjustment: this.compressorControls[this.form.controls.compressorControl.value].adjustment });
      }
      else {
        this.form.patchValue({ compressorControlAdjustment: this.compressorControls[this.form.controls.compressorControl.value].adjustment });
      }
    }
    else if (this.form.controls.compressorControl.value !== 8) {
      this.compressorCustomControl = false;
      this.form.patchValue({ compressorControlAdjustment: this.compressorControls[this.form.controls.compressorControl.value].adjustment });
    }
    else {
      if (this.form.controls.compressorControlAdjustment.valid) {
        this.compressorControls[8].adjustment = this.form.controls.compressorControlAdjustment.value;
      }
    }
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  changeUtilityType() {
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  changeMeasurementMethod() {
    this.compressedAirReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  calculateIndividualResult() {
    let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.getObjFromForm(this.form);
    this.individualResults = this.compressedAirReductionService.calculateIndividualEquipment(tmpObj, this.settings);
  }

  editEquipmentName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {
  }

  closeOperatingHoursModal(){
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(){
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours){
    this.compressedAirReductionService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth(){
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
