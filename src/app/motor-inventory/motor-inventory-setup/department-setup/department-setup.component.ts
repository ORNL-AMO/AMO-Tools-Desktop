import { Component, OnInit } from '@angular/core';
import { MotorInventoryService, MotorInventoryData, MotorInventoryDepartment } from '../../motor-inventory.service';

@Component({
  selector: 'app-department-setup',
  templateUrl: './department-setup.component.html',
  styleUrls: ['./department-setup.component.css']
})
export class DepartmentSetupComponent implements OnInit {

  motorInventoryData: MotorInventoryData;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
  }

  save() {
    this.motorInventoryService.motorInventoryData.next(this.motorInventoryData);
  }

  deleteDepartment(id: string) {
    this.motorInventoryData.departments.filter((department) => { return department.id == id });
    this.motorInventoryService.motorInventoryData.next(this.motorInventoryData);
  }

  addDepartment() {
    let newDepartment: MotorInventoryDepartment = this.motorInventoryService.getNewDepartment(this.motorInventoryData.departments.length + 1);
    this.motorInventoryData.departments.push(newDepartment);
    this.motorInventoryService.motorInventoryData.next(this.motorInventoryData);
  }
}
