import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { driveConstants, pumpTypesConstant } from '../../../../psat/psatConstants';
import { Settings } from '../../../../shared/models/settings';
import { PumpItem, PumpPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { FieldMeasurementsCatalogService } from '../field-measurements-catalog/field-measurements-catalog.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { PumpEquipmentCatalogService } from './pump-equipment-catalog.service';

@Component({
  selector: 'app-pump-equipment-catalog',
  templateUrl: './pump-equipment-catalog.component.html',
  styleUrls: ['./pump-equipment-catalog.component.css']
})
export class PumpEquipmentCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: PumpPropertiesOptions;
  displayForm: boolean = true;

  pumpTypes: Array<{value: number, display: string}>;
  shaftOrientations: Array<{value: number, display: string}> = [
    {value: 0, display: 'Vertical'}, 
    {value: 1, display: 'Horizontal'}, 
  ];
  shaftSealTypes: Array<{value: number, display: string}> = [
    {value: 0, display: 'Parking Seals'}, 
    {value: 1, display: 'Mechanical Seals'}, 
  ];


  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private pumpEquipmentCatalogService: PumpEquipmentCatalogService) { }

  ngOnInit(): void {
    this.pumpTypes = pumpTypesConstant;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.pumpEquipmentCatalogService.getFormFromPumpEquipmentProperties(selectedPump.pumpEquipment);
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.pumpEquipment = this.pumpEquipmentCatalogService.updatePumpEquipmentPropertiesFromForm(this.form, selectedPump.pumpEquipment);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('pump-equipment');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
