import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { NaturalGasReductionService } from '../natural-gas-reduction.service';
import { NaturalGasReductionResult, NaturalGasReductionData } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-natural-gas-reduction-form',
  templateUrl: './natural-gas-reduction-form.component.html',
  styleUrls: ['./natural-gas-reduction-form.component.css']
})
export class NaturalGasReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: NaturalGasReductionData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<NaturalGasReductionData>();
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
    { value: 0, name: 'Flow Meter Method' },
    { value: 1, name: 'Mass Flow of Air' },
    { value: 2, name: 'Mass Flow of Water' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  idString: string;
  individualResults: NaturalGasReductionResult;
  isEditingName: boolean = false;
  form: FormGroup;

  constructor(private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.naturalGasReductionService.getFormFromObj(this.data);
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
    this.naturalGasReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  calculateIndividualResult(){
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.getObjFromForm(this.form);
    this.individualResults = this.naturalGasReductionService.calculateIndividualEquipment(tmpObj, this.settings);
  }

  removeEquipment(i: number) {
    this.emitRemoveEquipment.emit(this.index);
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
