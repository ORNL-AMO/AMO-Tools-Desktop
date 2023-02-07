import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { ElectricityReductionService } from '../electricity-reduction.service';
import { ElectricityReductionResult, ElectricityReductionData } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-electricity-reduction-form',
  templateUrl: './electricity-reduction-form.component.html',
  styleUrls: ['./electricity-reduction-form.component.css']
})
export class ElectricityReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: ElectricityReductionData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<ElectricityReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Input()
  index: number;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  userSelectedHP: boolean;  
  @Input()
  modificationExists: boolean;

  isValid: boolean = true;



  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean;

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Multimeter Reading' },
    { value: 1, name: 'Name Plate Data' },
    { value: 2, name: 'Power Meter Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  idString: string;
  individualResults: ElectricityReductionResult;
  isEditingName: boolean = false;
  form: UntypedFormGroup;

  constructor(private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.electricityReductionService.getFormFromObj(this.data);
    if (this.selected == false) {
      this.form.disable();
    }
    this.calculateIndividualResult();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.userSelectedHP && !changes.userSelectedHP.firstChange){
      this.form.controls.userSelectedHP.patchValue(this.userSelectedHP);
      this.calculate();
    }
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  changeMeasurementMethod() {
    this.electricityReductionService.setValidators(this.form);
    this.calculate();
  }

  setNumberOfPhases(val: number) {
    this.form.controls.numberOfPhases.patchValue(val);
    this.calculate();
  }

  calculate() {
    let tmpObj: ElectricityReductionData = this.electricityReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  calculateIndividualResult() {
    this.isValid = this.electricityReductionService.checkWarnings(this.index, this.modificationExists);
    let tmpObj: ElectricityReductionData = this.electricityReductionService.getObjFromForm(this.form);
    this.individualResults = this.electricityReductionService.calculateIndividualEquipment(tmpObj, this.settings);
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

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.electricityReductionService.operatingHours = oppHours;
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  changeLineFrequency() {
    if (this.form.controls.variableSpeedMotor.value == false) {
      this.form.controls.operationalFrequency.patchValue(this.form.controls.lineFrequency.value);
    }
    this.calculate();
  }

  toggleUserSelectedHP(){
    let toggleValue: boolean = !this.form.controls.userSelectedHP.value;
    this.form.controls.userSelectedHP.patchValue(toggleValue);
    this.calculate();
  }
}
