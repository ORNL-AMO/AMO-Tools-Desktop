import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IntegrationState, InventorySelectOptions, InventoryOption, ConnectedInventoryData, ConnectedItem } from '../../shared/connected-inventory/integrations';
import { PsatIntegrationService } from '../../shared/connected-inventory/psat-integration.service';
import { Subscription } from 'rxjs';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-integrate-pump-inventory',
  templateUrl: './integrate-pump-inventory.component.html',
  styleUrls: ['./integrate-pump-inventory.component.css']
})
export class IntegratePumpInventoryComponent {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Output('savePsat')
  savePsat = new EventEmitter<PSAT>();
  @Input()
  selected: boolean;

  connectedAssessmentState: IntegrationState;
  inventorySelectOptions: InventorySelectOptions;
  connectedInventoryDataSub: Subscription;

  constructor(private psatIntegrationService: PsatIntegrationService,
    private helpPanelService: HelpPanelService,
    private integrationStateService: IntegrationStateService) { }

  ngOnInit() {
    if (this.assessment.psat.connectedItem) {
      this.psatIntegrationService.setPSATConnectedInventoryData(this.assessment, this.settings);
      this.savePsat.emit(this.assessment.psat);
      this.saved.emit(true);
    }
    this.setInventorySelectOptions();
    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
        this.handleConnectedInventoryEvents(connectedInventoryData);
    });
  }

  ngOnDestroy() {
    this.connectedInventoryDataSub.unsubscribe();
  }

  focusedField(field: string) {
    this.helpPanelService.currentField.next(field);
  }

 async handleConnectedInventoryEvents(connectedInventoryData: ConnectedInventoryData) {
    if (!connectedInventoryData.isConnected) {
      if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
        await this.psatIntegrationService.setPSATFromExistingPumpItem(connectedInventoryData, this.psat, this.assessment);
        if (connectedInventoryData.isConnected) {
          this.saved.emit(true);
        }
      }
    }

    if (connectedInventoryData.shouldDisconnect) {
      this.psatIntegrationService.removeConnectedPumpInventory(connectedInventoryData.connectedItem, connectedInventoryData.ownerAssessmentId);
      delete this.psat.connectedItem;
      this.saved.emit(true);
    }
  }

  async setInventorySelectOptions() {
    let pumpInventoryOptions: Array<InventoryOption> = await this.psatIntegrationService.initInventoriesAndOptions();
    this.inventorySelectOptions = {
      label: 'Select Pump Inventory',
      itemName: 'Pump',
      inventoryOptions: pumpInventoryOptions,
      shouldResetForm: false
    }
  }

}
