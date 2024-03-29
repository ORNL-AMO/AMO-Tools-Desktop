import { Injectable } from '@angular/core';
import { ConnectedInventoryData, IntegrationState } from './integrations';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class IntegrationStateService {
  integrationState: BehaviorSubject<IntegrationState>;
  integrationContainerOffsetHeight: BehaviorSubject<number>;
  connectedAssessmentState: BehaviorSubject<IntegrationState>;
  connectedInventoryData: BehaviorSubject<ConnectedInventoryData>;

  constructor() { 
    this.integrationState = new BehaviorSubject<IntegrationState>(this.getEmptyIntegrationState());
    this.integrationContainerOffsetHeight = new BehaviorSubject<number>(0);
    this.connectedAssessmentState = new BehaviorSubject<IntegrationState>(this.getEmptyIntegrationState());
    this.connectedInventoryData = new BehaviorSubject(this.getEmptyConnectedInventoryData());
  }

  getEmptyConnectedInventoryData(): ConnectedInventoryData {
    return {
      connectedItem: undefined,
    }
  }

  getEmptyIntegrationState(): IntegrationState {
    return {
      msgHTML: undefined,
      status: undefined
    }
  }
  
}
