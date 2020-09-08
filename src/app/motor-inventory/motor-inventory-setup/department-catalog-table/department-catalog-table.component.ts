import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorCatalogService } from '../motor-catalog/motor-catalog.service';
import { Subscription } from 'rxjs';
import { MotorInventoryDepartment, MotorInventoryData, MotorItem } from '../../motor-inventory';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-department-catalog-table',
  templateUrl: './department-catalog-table.component.html',
  styleUrls: ['./department-catalog-table.component.css']
})
export class DepartmentCatalogTableComponent implements OnInit {

  selectedMotorDepartment: MotorInventoryDepartment;

  motorInventoryDataSub: Subscription;
  motorInventoryData: MotorInventoryData;

  selectedDepartmentId: string;
  selectedDepartmentIdSub: Subscription;
  settings: Settings;
  settingsSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.motorInventoryService.settings.subscribe(val => {
      this.settings = val;
    })
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(val => {
      this.motorInventoryData = val;
      this.setSelectedMotorDepartment();
    });

    this.selectedDepartmentIdSub = this.motorCatalogService.selectedDepartmentId.subscribe(val => {
      this.selectedDepartmentId = val;
      this.setSelectedMotorDepartment();
    });
  }

  ngOnDestroy() {
    this.motorInventoryDataSub.unsubscribe();
    this.selectedDepartmentIdSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  setSelectedMotorDepartment() {
    if (this.motorInventoryData && this.selectedDepartmentId) {
      this.selectedMotorDepartment = this.motorInventoryData.departments.find(department => { return department.id == this.selectedDepartmentId });
    }
  }

  addNewMotor() {
    let newMotor: MotorItem = this.motorInventoryService.getNewMotor(this.selectedDepartmentId);
    this.motorInventoryData.departments.forEach(department => {
      if (department.id == this.selectedDepartmentId) {
        department.catalog.push(newMotor);
      }
    });
    this.motorInventoryService.motorInventoryData.next(this.motorInventoryData);
    this.motorCatalogService.selectedMotorItem.next(newMotor);
  }

  selectMotor(motor: MotorItem) {
    this.motorCatalogService.selectedMotorItem.next(motor);
  }
}
