import { Component } from '@angular/core';
import { ConnectedInventoryData, IntegrationState } from '../integrations';
import { IntegrationStateService } from '../integration-state.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-integration-status',
    templateUrl: './integration-status.component.html',
    styleUrls: ['./integration-status.component.css'],
    standalone: false
})
export class IntegrationStateComponent {
  integrationState: IntegrationState;
  showIntegrationStatus: boolean;
  integrationStateSub: Subscription;

  constructor(private integrationStateService: IntegrationStateService) {}

  ngOnInit() {
    this.integrationStateSub = this.integrationStateService.integrationState.subscribe(integrationState => {
      this.integrationState = integrationState;
      this.showStatus();
    });
  }
  ngOnDestroy() {
    this.integrationStateSub.unsubscribe();
    this.clearIntegrationState();
  }

  showStatus() {
    if (this.integrationState) {
      this.showIntegrationStatus = true;
    } else {
      this.showIntegrationStatus = false;
    }
  }

  convertItemUnits() {
    this.integrationState.msgHTML = undefined;
    this.integrationStateService.integrationState.next(this.integrationState);

    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.connectedInventoryData.getValue();
    connectedInventoryData.shouldConvertItemUnits = true;
    this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
  }

  clearIntegrationState() {
    this.integrationStateService.integrationState.next(this.integrationStateService.getEmptyIntegrationState());
    this.showIntegrationStatus = false;
  }
}
