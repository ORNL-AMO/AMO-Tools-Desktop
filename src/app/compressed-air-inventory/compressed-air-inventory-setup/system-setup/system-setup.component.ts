import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirInventorySystem } from '../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { MotorIntegrationService } from '../../../shared/connected-inventory/motor-integration.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrl: './system-setup.component.css'
})
export class SystemSetupComponent implements OnInit {


  settings: Settings;

  compressedAirInventoryData: CompressedAirInventoryData;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private motorIntegrationService: MotorIntegrationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
  }

  save() {
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  deleteSystem(id: string) {
    let systemIndex: number = this.compressedAirInventoryData.systems.findIndex((system) => { return system.id == id })
    //this.motorIntegrationService.removeDepartmentMotorConnections(this.pumpInventoryData, systemIndex);
    this.compressedAirInventoryData.systems.splice(systemIndex, 1);
    this.compressedAirInventoryService.setIsValidInventory(this.compressedAirInventoryData);
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  addSystem() {
    let newSystem: CompressedAirInventorySystem = this.compressedAirInventoryService.getNewSystem(this.compressedAirInventoryData.systems.length + 1);
    this.compressedAirInventoryData.systems.push(newSystem);
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

}
