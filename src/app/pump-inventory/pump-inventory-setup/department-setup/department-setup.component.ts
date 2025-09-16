import { Component, OnInit } from '@angular/core';
import { PumpInventoryData, PumpInventoryDepartment } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';
import { PumpMotorIntegrationService } from '../../../shared/connected-inventory/pump-motor-integration.service';

@Component({
    selector: 'app-department-setup',
    templateUrl: './department-setup.component.html',
    styleUrls: ['./department-setup.component.css'],
    standalone: false
})
export class DepartmentSetupComponent implements OnInit {


  pumpInventoryData: PumpInventoryData;
  constructor(private pumpInventoryService: PumpInventoryService, private pumpMotorIntegrationService: PumpMotorIntegrationService) { }

  ngOnInit(): void {
    this.pumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
  }

  save() {
    this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryData);
  }

  deleteDepartment(id: string) {
    let departmentIndex: number = this.pumpInventoryData.departments.findIndex((department) => { return department.id == id })
    this.pumpMotorIntegrationService.removeDepartmentMotorConnections(this.pumpInventoryData, departmentIndex);
    this.pumpInventoryData.departments.splice(departmentIndex, 1);
    this.pumpInventoryService.setIsValidInventory(this.pumpInventoryData);
    this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryData);
  }

  addDepartment() {
    let newDepartment: PumpInventoryDepartment = this.pumpInventoryService.getNewDepartment(this.pumpInventoryData.departments.length + 1);
    this.pumpInventoryData.departments.push(newDepartment);
    this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryData);
  }
}
