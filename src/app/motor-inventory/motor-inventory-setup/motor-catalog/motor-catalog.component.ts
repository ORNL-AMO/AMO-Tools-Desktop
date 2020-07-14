import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { FormGroup } from '@angular/forms';
import { MotorCatalogService } from './motor-catalog.service';
import { motorEfficiencyConstants, driveConstants } from '../../../psat/psatConstants';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Subscription } from 'rxjs';
import { SuiteDbMotor } from '../../../shared/models/materials';
import { MotorInventoryData, MotorInventoryDepartment, MotorItem } from '../../motor-inventory';

@Component({
  selector: 'app-motor-catalog',
  templateUrl: './motor-catalog.component.html',
  styleUrls: ['./motor-catalog.component.css']
})
export class MotorCatalogComponent implements OnInit {

  settings: Settings;

  motorInventoryData: MotorInventoryData;
  motorInventoryDataSub: Subscription;
  motorItemForm: FormGroup;

  drives: Array<{ display: string, value: number }>;

  selectedDepartmentIdSub: Subscription;
  showSelectMotorModal: boolean = false;
  selectedMotorItemSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
    this.drives = driveConstants;

    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(val => {
      this.motorInventoryData = val;
    });
    this.selectedDepartmentIdSub = this.motorCatalogService.selectedDepartmentId.subscribe(val => {
      if (!val) {
        this.motorCatalogService.selectedDepartmentId.next(this.motorInventoryData.departments[0].id);
      } else {
        let findDepartment: MotorInventoryDepartment = this.motorInventoryData.departments.find(department => { return department.id == val });
        this.motorCatalogService.selectedMotorItem.next(findDepartment.catalog[0]);
      }
    });
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorItemForm = this.motorCatalogService.getFormFromMotorItem(selectedMotor);
      }
    });
  }

  ngOnDestroy() {
    this.selectedDepartmentIdSub.unsubscribe();
    this.selectedMotorItemSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
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

  openMotorSelectionModal() {
    this.showSelectMotorModal = true;
  }

  closeMotorSelectionModal() {
    this.showSelectMotorModal = false;
  }

  setMotorSelection(dbMotor: SuiteDbMotor) {
    this.closeMotorSelectionModal();
    this.motorCatalogService.setSuiteDbMotorProperties(dbMotor, this.motorItemForm);
    this.save();
  }
}
