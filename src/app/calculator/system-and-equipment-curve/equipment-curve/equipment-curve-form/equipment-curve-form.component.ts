import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { EquipmentCurveService } from '../equipment-curve.service';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { CurveDataService } from '../../curve-data.service';
import { EquipmentInputs, ModificationEquipment } from '../../../../shared/models/system-and-equipment-curve';

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
  equipmentCurveForm: UntypedFormGroup;
  options: Array<{ display: string, value: number }> = [
    { display: 'Diameter', value: 0 },
    { display: 'Speed', value: 1 }
  ];
  modificationOptions: Array<{ display: string, value: number }> = [
    { display: 'Flow Rate', value: 0 },
    { display: 'Head', value: 1 },
  ];

  modWarning: string = null;
  resetFormsSub: Subscription;
  flowUnit: string;
  yValueUnit: string;
  constructor(private equipmentCurveService: EquipmentCurveService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private curveDataService: CurveDataService) { }

  ngOnInit() {
    this.initForm();
    this.setSmallUnit();
    this.resetFormsSub = this.curveDataService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetForm();
      }
    });
  }

  ngOnDestroy() {
    this.resetFormsSub.unsubscribe();
  }

  initForm() {
    let defaultData: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
    if (defaultData == undefined) {
      if (this.equipmentType == 'fan') {
        defaultData = this.equipmentCurveService.getResetEquipmentInputs('fan');
      } else {
        defaultData = this.equipmentCurveService.getResetEquipmentInputs('pump');
      }
    }
    this.systemAndEquipmentCurveService.equipmentInputs.next(defaultData);
    this.equipmentCurveForm = this.equipmentCurveService.getEquipmentCurveFormFromObj(defaultData);
  }

  resetForm() {
    let defaultData: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
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

  focusField(str: string) {
    this.systemAndEquipmentCurveService.focusedCalculator.next(this.equipmentType + '-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  changeMeasurementOption() {
    this.equipmentCurveForm.controls.modificationMeasurementOption.patchValue(this.equipmentCurveForm.controls.measurementOption.value);
    this.save();
  }

  save() {
    if (this.equipmentCurveForm.valid) {
      let equipmentInputs: EquipmentInputs = this.equipmentCurveService.getEquipmentCurveObjFromForm(this.equipmentCurveForm);
      this.systemAndEquipmentCurveService.equipmentInputs.next(equipmentInputs);
    } else {
      this.systemAndEquipmentCurveService.equipmentInputs.next(undefined);
    }
  }
}
