import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { EquipmentCurveService, ByDataInputs } from '../equipment-curve.service';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';

@Component({
  selector: 'app-by-data-form',
  templateUrl: './by-data-form.component.html',
  styleUrls: ['./by-data-form.component.css']
})
export class ByDataFormComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  settings: Settings;

  byDataForm: FormGroup;
  secondValueLabel: string;
  secondValueUnit: string;
  flowUnit: string;
  formLabel: string;
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ];
  constructor(private equipmentCurveService: EquipmentCurveService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (this.equipmentType == 'fan') {
      this.formLabel = 'Fan Data';
      this.secondValueLabel = 'Pressure';
      this.flowUnit = this.settings.fanFlowRate;
      this.secondValueUnit = this.settings.fanPressureMeasurement;
    } else {
      this.formLabel = 'Pump Data';
      this.secondValueLabel = 'Head';
      this.flowUnit = this.settings.flowMeasurement;
      this.secondValueUnit = this.settings.distanceMeasurement;
    }
    this.initForm();
  }

  initForm() {
    let defaultData: ByDataInputs = this.equipmentCurveService.byDataInputs.getValue();
    if (defaultData == undefined) {
      defaultData = this.equipmentCurveService.getByDataDefault(this.settings);
    }
    this.byDataForm = this.equipmentCurveService.getByDataFormFromObj(defaultData);
  }

  save() {
    let data = this.equipmentCurveService.getByDataObjFromForm(this.byDataForm);
    this.equipmentCurveService.byDataInputs.next(data);
  }

  focusField(str: string) {
    this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType);
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  addRow() {
    let tmpDataRowForm = this.formBuilder.group({
      flow: [0, [Validators.required, Validators.max(1000000)]],
      secondValue: [0, [Validators.required, Validators.min(0)]]
    });
    this.byDataForm.controls.dataRows.value.controls.push(tmpDataRowForm);
    this.save();
  }

  removeRow(index: number) {
    this.byDataForm.controls.dataRows.value.controls.splice(index, 1);
    this.save();
  }
}
