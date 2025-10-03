import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IntegrationState, InventorySelectOptions, InventoryOption, ConnectedInventoryData, ConnectedItem } from '../../shared/connected-inventory/integrations';
import { Subscription } from 'rxjs';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentIntegrationService } from '../../shared/connected-inventory/compressed-air-assessment-integration.service';
import { CompressedAirAssessment } from '../../shared/models/compressed-air-assessment';

@Component({
    selector: 'app-integrate-compressed-air-inventory',
    templateUrl: './integrate-compressed-air-inventory.component.html',
    styleUrls: ['./integrate-compressed-air-inventory.component.css'],
    standalone: false
})
export class IntegrateCompressedAirInventoryComponent {
    @Input()
    assessment: Assessment;
    @Input()
    settings: Settings;
    @Input()
    compressedAirAssessment: CompressedAirAssessment;
    @Output('saved')
    saved = new EventEmitter<boolean>();
    @Output('saveCompressedAirAssessment')
    saveCompressedAirAssessment = new EventEmitter<CompressedAirAssessment>();
    @Input()
    selected: boolean;

    connectedAssessmentState: IntegrationState;
    inventorySelectOptions: InventorySelectOptions;
    connectedInventoryDataSub: Subscription;

    constructor(private compressedAirAssessmentIntegrationService: CompressedAirAssessmentIntegrationService,
        //private helpPanelService: HelpPanelService,
        private integrationStateService: IntegrationStateService) { }

    ngOnInit() {
        if (this.assessment.compressedAirAssessment.connectedItem) {
            this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentConnectedInventoryData(this.assessment, this.settings);
            this.saveCompressedAirAssessment.emit(this.assessment.compressedAirAssessment);
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
        //this.helpPanelService.currentField.next(field);
    }

    async handleConnectedInventoryEvents(connectedInventoryData: ConnectedInventoryData) {
        if (!connectedInventoryData.isConnected) {
            if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
                await this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentFromExistingCompressedAirItem(connectedInventoryData, this.compressedAirAssessment, this.assessment);
                if (connectedInventoryData.isConnected) {
                    this.saved.emit(true);
                }
            }
        }

        if (connectedInventoryData.shouldDisconnect) {
            this.compressedAirAssessmentIntegrationService.removeConnectedCompressedAirInventory(connectedInventoryData.connectedItem, connectedInventoryData.ownerAssessmentId);
            delete this.compressedAirAssessment.connectedItem;
            this.saved.emit(true);
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

}
