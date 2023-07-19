import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { NameplateDataOptions, PumpItem } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { NameplateDataCatalogService } from './nameplate-data-catalog.service';

@Component({
  selector: 'app-nameplate-data-catalog',
  templateUrl: './nameplate-data-catalog.component.html',
  styleUrls: ['./nameplate-data-catalog.component.css']
})
export class NameplateDataCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: NameplateDataOptions;
  displayForm: boolean = true;

  statusTypes: Array<{value: number, display: string}>;
  priorityTypes: Array<{value: number, display: string}>;
  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private nameplateDataCatalogService: NameplateDataCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.nameplateDataCatalogService.getFormFromNameplateData(selectedPump.nameplateData);
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.nameplateDataOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.nameplateData = this.nameplateDataCatalogService.updateNameplateDataFromForm(this.form, selectedPump.nameplateData);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('nameplate-data');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
