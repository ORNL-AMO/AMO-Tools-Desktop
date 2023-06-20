import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IntegrationState, InventorySelectOptions, InventoryOption, ConnectedInventoryData, ConnectedItem } from '../../shared/assessment-integration/integrations';
import { PsatIntegrationService } from '../../shared/assessment-integration/psat-integration.service';
import { Subscription } from 'rxjs';
import { IntegrationStateService } from '../../shared/assessment-integration/integration-state.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';

@Component({
  selector: 'app-integrate-pump-inventory',
  templateUrl: './integrate-pump-inventory.component.html',
  styleUrls: ['./integrate-pump-inventory.component.css']
})
export class IntegratePumpInventoryComponent {
  @Input()
  assessment: Assessment;
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;

  assessmentIntegrationState: IntegrationState;
  inventorySelectOptions: InventorySelectOptions;
  connectedInventoryDataSub: Subscription;

  constructor(private psatIntegrationService: PsatIntegrationService,
    private helpPanelService: HelpPanelService,
    private integrationStateService: IntegrationStateService) { }

  ngOnInit() {
    this.psatIntegrationService.setPumpConnectedInventoryData(this.assessment);
    this.saved.emit(true)
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
      this.psatIntegrationService.removeConnectedInventory(connectedInventoryData);
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
