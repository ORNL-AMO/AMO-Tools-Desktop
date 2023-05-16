import { Injectable } from '@angular/core';
import { ConnectedInventoryData, IntegrationState } from './integrations';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class IntegrationStateService {
  integrationState: BehaviorSubject<IntegrationState>;
  connectedInventoryData: BehaviorSubject<ConnectedInventoryData>;

  constructor() { 
    this.integrationState = new BehaviorSubject<IntegrationState>({
      status: undefined,
      msgHTML: undefined,
    });
    this.connectedInventoryData = new BehaviorSubject(this.getEmptyConnectedInventoryData());
  }

  getEmptyConnectedInventoryData(): ConnectedInventoryData {
    return {
      connectedItem: undefined,
    }
  }


  resetIntegrationState() {
    let integrationState: IntegrationState = this.integrationState.getValue();
    integrationState.msgHTML = undefined;
    integrationState.status = undefined;
    this.integrationState.next(integrationState);
  }
  
}
