import { Component, OnInit, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { WaterReductionData, WaterReductionResult } from '../../../../shared/models/standalone';
import { WaterReductionService } from '../water-reduction.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-water-reduction-form',
  templateUrl: './water-reduction-form.component.html',
  styleUrls: ['./water-reduction-form.component.css']
})
export class WaterReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: WaterReductionData;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Input()
  isWastewater: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<WaterReductionData>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<number>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  selected: boolean;

  measurementOptions: Array<{ value: number, name: string }> = [
    {value: 0, name: 'Volume Meter'},
    {value: 1, name: 'Metered Flow'},
    {value: 2, name: 'Bucket Method'},
    {value: 3, name: 'Offsheet / Other Method'}
  ];

  form: FormGroup;
  idString: string;
  individualResults: WaterReductionResult;
  isEditingName: boolean = false;
  
  constructor(private waterReductionService: WaterReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.waterReductionService.getFormFromObj(this.data, this.index, this.isBaseline);
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
    this.waterReductionService.setValidators(this.form);
    this.calculate();
  }

  calculate() {
    let tmpObj: WaterReductionData = this.waterReductionService.getObjFromForm(this.form);
    this.calculateIndividualResult();
    this.emitCalculate.emit(tmpObj);
  }

  removeEquipment() {
    this.emitRemoveEquipment.emit(this.index);
  }

  calculateIndividualResult() {
    let tmpObj: WaterReductionData = this.waterReductionService.getObjFromForm(this.form);
    this.individualResults = this.waterReductionService.calculateIndividualEquipment(tmpObj, this.settings);
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
