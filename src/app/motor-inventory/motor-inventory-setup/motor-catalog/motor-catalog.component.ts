import { Component, OnInit } from '@angular/core';
import { MotorInventoryData, MotorInventoryService, MotorItem, MotorInventoryDepartment } from '../../motor-inventory.service';
import { FormGroup } from '@angular/forms';
import { MotorCatalogService } from './motor-catalog.service';
import { motorEfficiencyConstants, driveConstants } from '../../../psat/psatConstants';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-motor-catalog',
  templateUrl: './motor-catalog.component.html',
  styleUrls: ['./motor-catalog.component.css']
})
export class MotorCatalogComponent implements OnInit {

  settings: Settings;

  motorInventoryData: MotorInventoryData;

  motorItemForm: FormGroup;
  frequencies: Array<number> = [50, 60];
  efficiencyClasses: Array<{ value: number, display: string }>;
  drives: Array<{ display: string, value: number }>;

  selectedDepartmentIdSub: Subscription;

  constructor(private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
    this.efficiencyClasses = motorEfficiencyConstants;
    this.drives = driveConstants;

    this.motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.selectedDepartmentIdSub = this.motorCatalogService.selectedDepartmentId.subscribe(val => {
      if (!val) {
        this.motorCatalogService.selectedDepartmentId.next(this.motorInventoryData.departments[0].id);
      } else {
        let findDepartment: MotorInventoryDepartment = this.motorInventoryData.departments.find(department => { return department.id == val });
        this.initMotorForm(findDepartment);
      }
    });
  }

  ngOnDestroy() {
    this.selectedDepartmentIdSub.unsubscribe();
  }

  initMotorForm(department: MotorInventoryDepartment) {
    let selectedMotor: MotorItem;
    if (department.catalog.length != 0) {
      selectedMotor = department.catalog[0];
    } else {
      selectedMotor = this.motorInventoryService.getNewMotor(department.id)
    }
    this.motorItemForm = this.motorCatalogService.getFormFromMotorItem(selectedMotor);
  }


  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.getMotorItemFromForm(this.motorItemForm);
    let selectedDepartmentIndex: number = this.motorInventoryData.departments.findIndex(department => { return department.id == selectedMotor.departmentId });
    let catalogItemIndex: number = this.motorInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(motorItem => { return motorItem.id == selectedMotor.id; });
    this.motorInventoryData.departments[selectedDepartmentIndex].catalog[catalogItemIndex] = selectedMotor;
    this.motorInventoryService.motorInventoryData.next(this.motorInventoryData);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

  changeEfficiencyClass() {

    this.save();
  }

  changeLineFreq() {
    if (this.motorItemForm.controls.lineFrequency.value === 60) {
      if (this.motorItemForm.controls.motorRpm.value === 1485) {
        this.motorItemForm.controls.motorRpm.patchValue(1780);
      }
    } else if (this.motorItemForm.controls.lineFrequency.value === 50) {
      if (this.motorItemForm.controls.motorRpm.value === 1780) {
        this.motorItemForm.controls.motorRpm.patchValue(1485);
      }
    }
    this.save();
  }

  openOperatingHoursModal() {

  }
}
