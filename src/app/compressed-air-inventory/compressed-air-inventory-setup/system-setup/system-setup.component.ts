import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirInventorySystem } from '../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirMotorIntegrationService } from '../../../shared/connected-inventory/compressed-air-motor-integration.service';
import { ConnectedItem, IntegrationState } from '../../../shared/connected-inventory/integrations';
import { IntegrationStateService } from '../../../shared/connected-inventory/integration-state.service';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrl: './system-setup.component.css',
  standalone: false
})
export class SystemSetupComponent implements OnInit {


  settings: Settings;
  compressedAirInventoryData: CompressedAirInventoryData;
  selectedSystems = new Array<ConnectedItem>();
  connectedAssessmentState: IntegrationState;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, 
    private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService,  
    private integrationStateService: IntegrationStateService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.setSelectedSystems();
  }

  save() {
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  deleteSystem(id: string) {
    let systemIndex: number = this.compressedAirInventoryData.systems.findIndex((system) => { return system.id == id })
    this.compressedAirMotorIntegrationService.removeDepartmentMotorConnections(this.compressedAirInventoryData, systemIndex);
    this.compressedAirInventoryData.systems.splice(systemIndex, 1);
    this.compressedAirInventoryService.setIsValidInventory(this.compressedAirInventoryData);
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  addSystem() {
    let newSystem: CompressedAirInventorySystem = this.compressedAirInventoryService.getNewSystem(this.compressedAirInventoryData.systems.length + 1);
    this.compressedAirInventoryData.systems.push(newSystem);
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  setModalOpenView(event) {
    this.compressedAirInventoryService.modalOpen.next(true);
  }

  setSelectedSystems() {
    this.compressedAirInventoryData.systems.forEach(system => {
      let connectedCompressedAirItem: ConnectedItem = {
        id: system.id,
        name: system.name,
        inventoryId: this.compressedAirInventoryService.currentInventoryId,
        departmentId: system.id,
        inventoryType: 'compressed-air',
      }
      this.selectedSystems.push(connectedCompressedAirItem);
    });
  }

  setConnectedItemInfo() {
    if (this.compressedAirInventoryData.hasConnectedInventoryItems && this.compressedAirInventoryData.hasConnectedCompressedAirAssessment) {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: 'three-way-connected'
      }
    } else if (this.compressedAirInventoryData.hasConnectedInventoryItems) {      
      this.integrationStateService.integrationState.next({ status: 'connected-to-inventory' });

    } else if (this.compressedAirInventoryData.hasConnectedCompressedAirAssessment) {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: 'connected-to-assessment'
      }
    } else {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: undefined
      }

    }
  }

}