import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { EquipmentCurveService, EquipmentInputs } from '../equipment-curve.service';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';

@Component({
  selector: 'app-equipment-curve-form',
  templateUrl: './equipment-curve-form.component.html',
  styleUrls: ['./equipment-curve-form.component.css']
})
export class EquipmentCurveFormComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  settings: Settings;


  smallUnit: string;
  equipmentCurveForm: FormGroup;
  options: Array<{ display: string, value: number }> = [
    { display: 'Diameter', value: 0 },
    { display: 'Speed', value: 1 }
  ];
  modWarning: string = null;
  constructor(private equipmentCurveService: EquipmentCurveService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.initForm();
    this.setSmallUnit();
  }

  initForm() {
    let defaultData: EquipmentInputs = this.equipmentCurveService.getEquipmentCurveDefault();
    this.equipmentCurveForm = this.equipmentCurveService.getEquipmentCurveFormFromObj(defaultData);
  }

  setSmallUnit() {
    if (this.equipmentType == 'pump') {
      if (this.settings.distanceMeasurement === 'ft') {
        this.smallUnit = 'in';
      } else {
        this.smallUnit = 'cm';
      }
    }
    else {
      if (this.settings.fanFlowRate === 'ft3/min') {
        this.smallUnit = 'in';
      }
      else {
        this.smallUnit = 'cm';
      }
    }
  }

  checkWarnings() {
    // if (this.pumpCurveForm.controls.modifiedMeasurement.value < (this.pumpCurveForm.controls.baselineMeasurement.value * .5) || this.pumpCurveForm.controls.modifiedMeasurement.value > (this.pumpCurveForm.controls.baselineMeasurement.value * 1.5)) {
    //   this.modWarning = "Modified value must be within +/-50% of the baseline value.";
    // }
    // else {
    //   this.modWarning = null;
    // }
  }

  focusField(str: string) {
    this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  changeMeasurementOption() {
    this.equipmentCurveForm.controls.modificationMeasurementOption.patchValue(this.equipmentCurveForm.controls.measurementOption.value);
    this.save();
  }

  save() {

  }
}
