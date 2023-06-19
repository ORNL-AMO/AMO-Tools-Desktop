import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { PumpItem, SystemPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService, pumpInventoryDriveConstants } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { SystemCatalogService } from './system-catalog.service';

@Component({
  selector: 'app-system-catalog',
  templateUrl: './system-catalog.component.html',
  styleUrls: ['./system-catalog.component.css']
})
export class SystemCatalogComponent implements OnInit {

  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: SystemPropertiesOptions;
  displayForm: boolean = true;
  driveTypes: Array<{value: number, display: string}>;
  hasConnectedInventories: boolean;

  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private systemCatalogService: SystemCatalogService) { }

  ngOnInit(): void {
    this.driveTypes = pumpInventoryDriveConstants;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.hasConnectedInventories = Boolean(selectedPump.connectedItem);
        this.form = this.systemCatalogService.getFormFromPumpMotor(selectedPump.systemProperties);
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.systemPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.systemProperties = this.systemCatalogService.updatePumpMotorFromForm(this.form, selectedPump.systemProperties);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('system-catalog');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
