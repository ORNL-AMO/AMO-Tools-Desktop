import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { EquipmentCurveService, ByDataInputs } from '../equipment-curve.service';

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
  constructor(private equipmentCurveService: EquipmentCurveService) { }

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
    let defaultData: ByDataInputs = this.equipmentCurveService.getByDataDefault(this.settings);
    this.byDataForm = this.equipmentCurveService.getByDataFormFromObj(defaultData);

  }

}
