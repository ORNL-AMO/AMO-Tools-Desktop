import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { IntegrationStateService } from '../integration-state.service';
import { IntegrationFormGroupString, IntegrationState, ConnectedInventoryData } from '../integrations';

@Component({
    selector: 'app-connected-assessment-status',
    templateUrl: './connected-assessment-status.component.html',
    styleUrls: ['./connected-assessment-status.component.css'],
    standalone: false
})
export class ConnectedAssessmentStatusComponent {
  @Input()
  connectedFormGroupName: IntegrationFormGroupString;
  @Input()
  connectedToType: 'assessment' | 'inventory';
  @Input()
  // has priority over integrationStateService state
  parentIntegrationState: IntegrationState;
  @Input()
  // for connections with N items inside the connected resource (like compressors)
  // to identify which item the status is for
  itemId: string;
  
  connectedFieldMsgHTML: string;

  integrationState: IntegrationState;
  showIntegrationStatus: boolean;
  connectedAssessmentStateSub: Subscription;

  constructor(private integrationStateService: IntegrationStateService, 
    private cd: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.parentIntegrationState) {
      this.connectedAssessmentStateSub = this.integrationStateService.connectedAssessmentState.subscribe(integrationState => {
        this.integrationState = integrationState;
        this.showStatus();
        this.cd.detectChanges();
      });
    } else {
      this.integrationState = this.parentIntegrationState;
      this.showStatus();
    }
  }

  // todo move to input getters/setters
  ngOnChanges(changes: SimpleChanges) {
    if (changes.parentIntegrationState) {
      this.integrationState = this.parentIntegrationState;
      this.showStatus();
    }

    if (changes.itemId) {
      this.showStatus();
    }
  }

  ngOnDestroy() {
    if (this.connectedAssessmentStateSub) {
      this.connectedAssessmentStateSub.unsubscribe();
    }
  }

  showStatus() {
    this.showIntegrationStatus = false;
    if (this.integrationState) {
      if (this.integrationState.connectedAssessmentStatus === 'connected-assessment-differs') {
        this.setDifferingValuesMessage();
      } else {
        this.showIntegrationStatus = true;
      }
    }
  }

  setDifferingValuesMessage() {
    let differingField = this.integrationState.differingConnectedValues.find(field => {
      return field.formGroup === this.connectedFormGroupName;
    });
    if (differingField) {
      // todo update so field language is dynamic. Set messages in each integration service during validation
        if (this.connectedFormGroupName === 'compressed-air') {
          this.connectedFieldMsgHTML = `Compressor field value differs from the connected ${this.connectedToType}. 
            <b>Changing connected values in nameplate, motor, controls, design details or performance points will end the ${this.connectedToType} connection. </b>`;
        } else if (this.connectedToType === 'assessment') {
          this.connectedFieldMsgHTML = `${_.capitalize(differingField.formGroup)} field value differs from the connected ${this.connectedToType}. 
            <b>Changing connected values in motor, equipment, system, or fluid will end the ${this.connectedToType} connection. </b>`;
        } else {
          this.connectedFieldMsgHTML = `${_.capitalize(differingField.formGroup)} field value differs from the connected ${this.connectedToType}. 
            <b>Changing connected values in pump, fluid, or motor will end the ${this.connectedToType} connection. </b>`;
        }

        const isCurrentResourceDiffering = this.itemId ? (differingField.itemId === this.itemId) : true;
        this.showIntegrationStatus = isCurrentResourceDiffering;
    }
  }

  convertItemUnits() {
    this.integrationState.msgHTML = undefined;
    this.integrationStateService.connectedAssessmentState.next(this.integrationState);

    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.connectedInventoryData.getValue();
    connectedInventoryData.shouldConvertItemUnits = true;
    this.updateIntegrationStates(connectedInventoryData);
  }

  restoreConnectedValues() {
    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.connectedInventoryData.getValue();
    connectedInventoryData.shouldRestoreConnectedValues = true;
    this.updateIntegrationStates(connectedInventoryData);
  }

  updateIntegrationStates(connectedInventoryData: ConnectedInventoryData) {
    this.integrationState.msgHTML = undefined;
    this.integrationStateService.connectedAssessmentState.next(this.integrationState);
    this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
  }

  dismiss() {
    this.showIntegrationStatus = false;
  }

  clearIntegrationState() {
    this.integrationStateService.connectedAssessmentState.next(this.integrationStateService.getEmptyIntegrationState());
    this.showIntegrationStatus = false;
  }
}