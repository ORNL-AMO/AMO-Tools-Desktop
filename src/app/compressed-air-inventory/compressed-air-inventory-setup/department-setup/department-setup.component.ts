import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirInventoryDepartment } from '../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { MotorIntegrationService } from '../../../shared/connected-inventory/motor-integration.service';

@Component({
  selector: 'app-department-setup',
  templateUrl: './department-setup.component.html',
  styleUrl: './department-setup.component.css'
})
export class DepartmentSetupComponent implements OnInit {

  compressedAirInventoryData: CompressedAirInventoryData;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private motorIntegrationService: MotorIntegrationService) { }

  ngOnInit(): void {
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
  }

  save() {
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  deleteDepartment(id: string) {
    let departmentIndex: number = this.compressedAirInventoryData.departments.findIndex((department) => { return department.id == id })
    //this.motorIntegrationService.removeDepartmentMotorConnections(this.pumpInventoryData, departmentIndex);
    this.compressedAirInventoryData.departments.splice(departmentIndex, 1);
    this.compressedAirInventoryService.setIsValidInventory(this.compressedAirInventoryData);
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  addDepartment() {
    let newDepartment: CompressedAirInventoryDepartment = this.compressedAirInventoryService.getNewDepartment(this.compressedAirInventoryData.departments.length + 1);
    this.compressedAirInventoryData.departments.push(newDepartment);
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

}
