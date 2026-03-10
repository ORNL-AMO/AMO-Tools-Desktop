import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IntegrationState, InventorySelectOptions, InventoryOption, ConnectedInventoryData, ConnectedItem } from '../../../../shared/connected-inventory/integrations';
import { Subscription } from 'rxjs';
import { IntegrationStateService } from '../../../../shared/connected-inventory/integration-state.service';
import { Assessment } from '../../../../shared/models/assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentIntegrationService } from '../../../../shared/connected-inventory/compressed-air-assessment-integration.service';
import { CompressedAirAssessment } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { Router } from '@angular/router';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';

@Component({
    selector: 'app-integrate-compressed-air-inventory',
    templateUrl: './integrate-compressed-air-inventory.component.html',
    styleUrls: ['./integrate-compressed-air-inventory.component.css'],
    standalone: false
})
export class IntegrateCompressedAirInventoryComponent {

    connectedAssessmentState: IntegrationState;
    inventorySelectOptions: InventorySelectOptions;
    connectedInventoryDataSub: Subscription;

    compressedAirAssessmentSub: Subscription;
    compressedAirAssessment: CompressedAirAssessment;
    settings: Settings;
    // assessment: Assessment;

    constructor(private compressedAirAssessmentIntegrationService: CompressedAirAssessmentIntegrationService,
        //private helpPanelService: HelpPanelService,
        private integrationStateService: IntegrationStateService,
        private compressedAirAssessmentService: CompressedAirAssessmentService,
        private router: Router,
        private assessmentDbService: AssessmentDbService
    ) { }

    ngOnInit() {
        this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
            this.compressedAirAssessment = compressedAirAssessment;
            if (this.compressedAirAssessment.connectedItem) {
                let needsSave: boolean = this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentConnectedInventoryData(this.compressedAirAssessment, this.settings);
                if (needsSave) {
                    this.saveChanges();
                }
            }
        });
        this.setInventorySelectOptions();
        this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
            this.handleConnectedInventoryEvents(connectedInventoryData);
        });
    }

    ngOnDestroy() {
        this.connectedInventoryDataSub.unsubscribe();
        this.compressedAirAssessmentSub.unsubscribe();
    }

    focusedField(field: string) {
        //this.helpPanelService.currentField.next(field);
    }

    async handleConnectedInventoryEvents(connectedInventoryData: ConnectedInventoryData) {
        if (!connectedInventoryData.isConnected) {
            if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
                let assessmentId: number = parseInt(this.router.url.split('/')[2]);
                let assessment: Assessment = this.assessmentDbService.findById(assessmentId);
                await this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentFromExistingCompressedAirItem(connectedInventoryData, this.compressedAirAssessment, assessment);
                if (connectedInventoryData.isConnected) {
                    // this.saved.emit(true);
                    this.saveChanges();
                }
            }
        }

        if (connectedInventoryData.shouldDisconnect) {
            this.compressedAirAssessmentIntegrationService.removeConnectedCompressedAirInventory(connectedInventoryData.connectedItem, connectedInventoryData.ownerAssessmentId);
            delete this.compressedAirAssessment.connectedItem;
            // this.saved.emit(true);
            this.saveChanges();
        }
    }

    async setInventorySelectOptions() {
        let compressedAirInventoryOptions: Array<InventoryOption> = await this.compressedAirAssessmentIntegrationService.initInventoriesAndOptions();
        this.inventorySelectOptions = {
            label: 'Select Compressed Air Inventory',
            itemName: 'Compressed Air',
            inventoryOptions: compressedAirInventoryOptions,
            shouldResetForm: false
        }
    }

    saveChanges() {
        this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
    }

}
