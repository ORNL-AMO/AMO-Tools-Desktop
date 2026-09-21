import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { inventoryPumpTypesConstant, isPositiveDisplacementPump } from '../../../../psat/psatConstants';
import { Settings } from '../../../../shared/models/settings';
import { PumpItem, PumpPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService, pumpInventoryShaftOrientations, pumpInventoryShaftSealTypes } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { PumpEquipmentCatalogService } from './pump-equipment-catalog.service';
import { notWholeNumberMsg } from '../../../../psat/psatConstants';

@Component({
    selector: 'app-pump-equipment-catalog',
    templateUrl: './pump-equipment-catalog.component.html',
    styleUrls: ['./pump-equipment-catalog.component.css'],
    standalone: false
})
export class PumpEquipmentCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: PumpPropertiesOptions;
  displayForm: boolean = true;

  notWholeNumberMsg: string = notWholeNumberMsg;
  pumpTypes: Array<{value: number, display: string}>;
  shaftOrientations: Array<{value: number, display: string}>;
  shaftSealTypes: Array<{value: number, display: string}>;
  pumpTypeChangeBlockedMsg: string;

  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private pumpEquipmentCatalogService: PumpEquipmentCatalogService) { }

  ngOnInit(): void {
    this.shaftOrientations = pumpInventoryShaftOrientations;
    this.shaftSealTypes = pumpInventoryShaftSealTypes;
    this.pumpTypes = inventoryPumpTypesConstant;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.pumpEquipmentCatalogService.getFormFromPumpEquipmentProperties(selectedPump.pumpEquipment);
        this.pumpTypeChangeBlockedMsg = undefined;
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  get isPositiveDisplacement(): boolean {
    return isPositiveDisplacementPump(this.form.controls.pumpType.value);
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.pumpEquipment = this.pumpEquipmentCatalogService.updatePumpEquipmentPropertiesFromForm(this.form, selectedPump.pumpEquipment);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  changePumpType() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    let hasConnectedAssessments: boolean = selectedPump.connectedAssessments && selectedPump.connectedAssessments.length !== 0;
    if (this.isPositiveDisplacement && hasConnectedAssessments) {
      // selectedPump.pumpEquipment.pumpType still holds the pre-change value until save() runs.
      this.form.controls.pumpType.setValue(selectedPump.pumpEquipment.pumpType, { emitEvent: false });
      this.pumpTypeChangeBlockedMsg = `${selectedPump.name} is connected to a PSAT assessment and cannot be changed to Positive Displacement. Remove the connection first.`;
      return;
    }
    this.pumpTypeChangeBlockedMsg = undefined;

    this.form = this.pumpEquipmentCatalogService.updateDesignDifferentialPressureValidators(this.form);
    if (this.isPositiveDisplacement) {
      this.form.controls.designHead.reset(null);
    } else {
      this.form.controls.designDifferentialPressure.reset(null);
    }
    this.save();
    this.pumpCatalogService.pumpTypeChanged.next(this.form.controls.pumpType.value);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('pump-equipment');
    this.pumpInventoryService.focusedField.next(str);
  }

  addStage() {
      this.form.patchValue({
        numStages: this.form.controls.numStages.value + 1
      })
    this.save();
  }

  subtractStage() {
      if (this.form.controls.numStages.value != 1) {
        this.form.patchValue({
          numStages: this.form.controls.numStages.value - 1
        })
    }
    this.save();
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }
}
