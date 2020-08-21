import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { FormGroup } from '@angular/forms';
import { MotorInventoryService } from '../../motor-inventory.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-plant-setup',
  templateUrl: './plant-setup.component.html',
  styleUrls: ['./plant-setup.component.css']
})
export class PlantSetupComponent implements OnInit {

  settingsForm: FormGroup;
  settings: Settings;
  constructor(private settingsDbService: SettingsDbService, private settingsService: SettingsService,
    private motorInventoryService: MotorInventoryService, private indexedDbService: IndexedDbService) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  save(){
    let id: number = this.settings.id;
    let createdDate = this.settings.createdDate;
    let inventoryId: number = this.settings.inventoryId;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.inventoryId = inventoryId;
    this.motorInventoryService.settings.next(this.settings);
    //TODO: check for changes and add conversion logic
    this.indexedDbService.putSettings(this.settings).then(() => {
      this.settingsDbService.setAll();
    });
  }

}
