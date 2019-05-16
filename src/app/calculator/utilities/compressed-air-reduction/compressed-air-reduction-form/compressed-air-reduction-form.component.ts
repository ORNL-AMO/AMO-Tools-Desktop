import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirReductionService } from '../compressed-air-reduction.service';
import { CompressedAirReductionResult } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-compressed-air-reduction-form',
  templateUrl: './compressed-air-reduction-form.component.html',
  styleUrls: ['./compressed-air-reduction-form.component.css']
})
export class CompressedAirReductionFormComponent implements OnInit {
  @Input()
  form: FormGroup;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<{ form: FormGroup, index: number, isBaseline: boolean }>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Output('emitRemoveEquipment')
  emitRemoveEquipment = new EventEmitter<{ index: number, isBaseline: boolean }>();

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Flow Meter' },
    { value: 1, name: 'Bag Method' },
    { value: 2, name: 'Orifice/Pressure Method' },
    { value: 3, name: 'Offsheet/Other Method' }
  ];
  utilityTypes: Array<{ value: number, name: string }> = [
    { value: 0, name: 'None' },
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

  compressorCustomControl: boolean = false;

  idString: string;
  individualResults: CompressedAirReductionResult;
  isEditingName: boolean = false;
  constructor(private compressedAirReductionService: CompressedAirReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.calculate();
  }

  changeCompressorControl() {
    if (!this.compressorCustomControl) {
      let tmpObject = this.compressedAirReductionService.getObjFromForm(this.form);
      tmpObject.compressorElectricityData.compressorControlAdjustment = this.compressorControls[this.form.controls.compressorControl.value].adjustment;
    }
  }

  changeUtilityType() {
    this.calculate();
  }

  changeMeasurementMethod() {
    let tmpObject = this.compressedAirReductionService.getObjFromForm(this.form);
    this.form = this.compressedAirReductionService.getFormFromObj(tmpObject);
    this.calculate();
  }

  setNumberOfPhases(val: number) {
    this.form.controls.numberOfPhases.setValue(val);
    this.calculate();
  }

  calculate() {
    if (this.form.valid) {
      let emitObj = {
        form: this.form,
        index: this.index,
        isBaseline: this.isBaseline
      };
      this.emitCalculate.emit(emitObj);
      this.individualResults = this.compressedAirReductionService.calculateIndividualEquipment(this.compressedAirReductionService.getObjFromForm(this.form), this.settings);
    }
  }

  removeEquipment(i: number) {
    this.emitRemoveEquipment.emit({ index: i, isBaseline: this.isBaseline });
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
