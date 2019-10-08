import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { EquipmentCurveService, ByEquationInputs } from '../equipment-curve.service';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';

@Component({
  selector: 'app-by-equation-form',
  templateUrl: './by-equation-form.component.html',
  styleUrls: ['./by-equation-form.component.css']
})
export class ByEquationFormComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  settings: Settings;

  byEquationForm: FormGroup;
  formLabel: string;
  flowUnit: string;
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]
  constructor(private equipmentCurveService: EquipmentCurveService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.setFormLabelAndUnit();
    this.initForm();
  }

  initForm() {
    let defaultData: ByEquationInputs = this.equipmentCurveService.getByEquationDefault(this.flowUnit, this.settings.distanceMeasurement);
    this.byEquationForm = this.equipmentCurveService.getByEquationFormFromObj(defaultData);
  }

  setFormLabelAndUnit() {
    if (this.equipmentType == 'fan') {
      this.formLabel = 'Pressure Equation Coefficients';
      this.flowUnit = this.settings.fanFlowRate;
    } else if (this.equipmentType == 'pump') {
      this.formLabel = 'Head Equation Coefficients';
      this.flowUnit = this.settings.flowMeasurement;
    }
  }

  save() {

  }

  focusField(str: string) {
    this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }
}
