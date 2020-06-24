import { Component, OnInit } from '@angular/core';
import { MotorInventoryService, MotorInventoryDepartment, MotorInventoryData } from '../../motor-inventory.service';
import { MotorCatalogService } from '../motor-catalog/motor-catalog.service';
import { Subscription } from 'rxjs';

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
  constructor(private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(val => {
      this.motorInventoryData = val;
      this.setSelectedMotorDepartment();
    });

    this.selectedDepartmentIdSub = this.motorCatalogService.selectedDepartmentId.subscribe(val => {
      this.selectedDepartmentId = val;
      this.setSelectedMotorDepartment();
    });
  }

  ngOnDestroy(){
    this.motorInventoryDataSub.unsubscribe();
    this.selectedDepartmentIdSub.unsubscribe();
  }

  setSelectedMotorDepartment() {
    if (this.motorInventoryData && this.selectedDepartmentId) {
      this.selectedMotorDepartment = this.motorInventoryData.departments.find(department => { return department.id == this.selectedDepartmentId });
      console.log(this.selectedMotorDepartment);
    }
  }

}
