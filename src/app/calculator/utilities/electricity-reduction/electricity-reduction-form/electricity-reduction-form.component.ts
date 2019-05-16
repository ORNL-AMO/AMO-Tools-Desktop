import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { ElectricityReductionService } from '../electricity-reduction.service';
import { ElectricityReductionResult, ElectricityReductionData } from '../../../../shared/models/standalone';


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


  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Multimeter Reading' },
    { value: 1, name: 'Name Plate Data' },
    { value: 2, name: 'Power Meter Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  idString: string;

  individualResults: ElectricityReductionResult;

  isEditingName: boolean = false;
  form: FormGroup;

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
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
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

  calculateIndividualResult(){
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
}
