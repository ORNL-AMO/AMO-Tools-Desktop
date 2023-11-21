import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { UntypedFormGroup } from '@angular/forms';
import { MotorWarnings, PsatWarningService } from '../psat-warning.service';
import { MotorService } from './motor.service';
import { motorEfficiencyConstants } from '../psatConstants';
import { PsatService } from '../psat.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { ConnectedInventoryData, InventoryOption, InventorySelectOptions } from '../../shared/connected-inventory/integrations';
import { MotorIntegrationService } from '../../shared/connected-inventory/motor-integration.service';
import { Subscription } from 'rxjs';
import { PsatIntegrationService } from '../../shared/connected-inventory/psat-integration.service';
import { Assessment } from '../../shared/models/assessment';
@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modificationIndex: number;

  efficiencyClasses: Array<{ value: number, display: string }>;
  frequencies: Array<number> = [
    50,
    60
  ];

  psatForm: UntypedFormGroup;
  motorWarnings: MotorWarnings;
  //disableFLAOptimized: boolean = false;
  hasConnectedPumpInventory: boolean;
  idString: string;
  inventorySelectOptions: InventorySelectOptions;
  connectedInventoryDataSub: Subscription;
  connectedInventoryType: string;
  integrationContainerOffsetHeight: number = 0;
  integrationContainerOffsetHeightSub: Subscription;

  constructor(private psatWarningService: PsatWarningService, 
    private psatService: PsatService, 
    private psatIntegrationService: PsatIntegrationService, 
    private integrationStateService: IntegrationStateService,
    private compareService: CompareService, 
    private helpPanelService: HelpPanelService, 
    private motorIntegrationService: MotorIntegrationService,
    private motorService: MotorService) { }

  async ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    if (!this.baseline) {
      this.idString = 'psat_modification_' + this.modificationIndex;
      this.integrationContainerOffsetHeightSub = this.integrationStateService.integrationContainerOffsetHeight.subscribe(height => {
        this.integrationContainerOffsetHeight = height;
      })
    }
    else {
      this.idString = 'psat_baseline';
    }
    await this.initPsatMotorForm();
    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.handleConnectedInventoryEvents(connectedInventoryData);
    });

    if (!this.selected) {
      this.psatForm.disable();
    }
  }

  ngOnDestroy() {
    this.connectedInventoryDataSub.unsubscribe();
    if (!this.baseline) {
      this.integrationStateService.integrationContainerOffsetHeight.next(undefined);
      this.integrationContainerOffsetHeightSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    let connectedItem = this.psat.connectedItem && this.integrationStateService.connectedInventoryData.getValue()?.isConnected;
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (!this.selected || connectedItem) {
        this.psatForm.disable();
      } else if (!connectedItem) {
        this.psatForm.enable();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange() ||
      changes.psat && !changes.psat.isFirstChange()) {
      this.initPsatMotorForm();
    }
  }

  async setInventorySelectOptions() {
    let motorInventoryOptions: Array<InventoryOption> = await this.motorIntegrationService.initInventoriesAndOptions();
    this.inventorySelectOptions = {
      label: 'Connect an Existing Motor Inventory',
      itemName: 'Motor',
      inventoryOptions: motorInventoryOptions,
      shouldResetForm: false
    }
    this.connectedInventoryType = 'motor';
  }

  async initPsatMotorForm() {
    let connectedInventoryData = this.integrationStateService.connectedInventoryData.getValue();
    this.hasConnectedPumpInventory = connectedInventoryData.connectedItem && connectedInventoryData.connectedItem.inventoryType === 'pump';
    if (this.hasConnectedPumpInventory) {
      this.connectedInventoryType = 'pump';
    }

    if (this.psat.connectedItem && this.psat.connectedItem.inventoryType === 'motor') {
      await this.psatIntegrationService.setFromConnectedMotorItem(this.psat, this.assessment, this.settings);
    }

    this.psatForm = this.motorService.getFormFromObj(this.psat.inputs);
    if (connectedInventoryData.connectedItem && (this.baseline || this.inSetup)) {
      this.psatForm.disable();
    } else {
      this.psatForm.enable();
    }
    this.helpPanelService.currentField.next('lineFrequency');
    this.checkWarnings();

    if (this.inSetup) {
      await this.setInventorySelectOptions();
    }
  }

  async handleConnectedInventoryEvents(connectedInventoryData: ConnectedInventoryData) {
    if (!connectedInventoryData.isConnected) {
      if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
        await this.psatIntegrationService.setPSATFromExistingMotorItem(connectedInventoryData, this.psat, this.assessment);
        if (connectedInventoryData.isConnected) {
          this.initPsatMotorForm();
          this.saved.emit(true);
        }
      }
    }

    if (connectedInventoryData.shouldDisconnect) {
      if (this.psat.connectedItem.inventoryType === 'motor') {
        await this.psatIntegrationService.removeMotorConnectedItem(connectedInventoryData.connectedItem);
      } else if (this.psat.connectedItem.inventoryType === 'pump') {
        await this.psatIntegrationService.removeConnectedPumpInventory(connectedInventoryData.connectedItem, this.assessment.id);  
      }
      delete this.psat.connectedItem;
      // delete assessment.psat item = allow integrate-pump-inventory to appear in system-basics again
      delete this.assessment.psat.connectedItem;
      this.psatForm.enable();
      this.saved.emit(true);
    }
  }

  checkWarnings() {
    this.motorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings, !this.baseline);
  }

  changeEfficiencyClass() {
    this.psatForm = this.motorService.updateFormEfficiencyValidators(this.psatForm);
    this.save();
  }

  changeLineFreq() {
    if (this.psatForm.controls.frequency.value == 60) {
      if (this.psatForm.controls.motorRPM.value == 1485) {
        this.psatForm.patchValue({
          motorRPM: 1780
        })
      }
    } else if (this.psatForm.controls.frequency.value == 50) {
      if (this.psatForm.controls.motorRPM.value == 1780) {
        this.psatForm.patchValue({
          motorRPM: 1485
        })
      }
    }
    this.save();
  }

  getFullLoadAmps() {
    if (!this.disableFLA()) {
      this.psatForm = this.psatService.setFormFullLoadAmps(this.psatForm, this.settings);
      this.save();
    }
  }

  disableFLA() {
    return this.motorService.disableFLA(this.psatForm);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  save() {
    this.psat.inputs = this.motorService.getInputsFromFrom(this.psatForm, this.psat.inputs);
    this.checkWarnings();
    this.saved.emit(this.selected);
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isLineFreqDifferent() {
    if (this.canCompare()) {
      return this.compareService.isLineFreqDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedPowerDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedPowerDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedSpeedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedSpeedDifferent();
    } else {
      return false;
    }
  }
  isEfficiencyClassDifferent() {
    if (this.canCompare()) {
      return this.compareService.isEfficiencyClassDifferent();
    } else {
      return false;
    }
  }
  isEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isEfficiencyDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedVoltageDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedVoltageDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedFlaDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedFlaDifferent();
    } else {
      return false;
    }
  }
}
