import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { PumpPropertiesOptions, PumpItem, PumpStatusOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { PumpStatusCatalogService } from './pump-status-catalog.service';
import { priorityTypes, statusTypes } from '../../../../psat/psatConstants';

@Component({
  selector: 'app-pump-status-catalog',
  templateUrl: './pump-status-catalog.component.html',
  styleUrls: ['./pump-status-catalog.component.css']
})
export class PumpStatusCatalogComponent implements OnInit {

  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: PumpStatusOptions;
  displayForm: boolean = true;

  statusTypes: Array<{value: number, display: string}>;
  priorityTypes: Array<{value: number, display: string}>;
  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private pumpStatusCatalogService: PumpStatusCatalogService) { }

  ngOnInit(): void {
    this.statusTypes = statusTypes;
    this.priorityTypes = priorityTypes;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.pumpStatusCatalogService.getFormFromPumpStatus(selectedPump.pumpStatus);
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpStatusOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.pumpStatus = this.pumpStatusCatalogService.updatePumpStatusFromForm(this.form, selectedPump.pumpStatus);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('pump-status');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
