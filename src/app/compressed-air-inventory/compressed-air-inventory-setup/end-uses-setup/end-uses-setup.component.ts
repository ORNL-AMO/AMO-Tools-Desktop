import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { EndUsesService, EndUseWarnings, UpdatedEndUseData } from './end-uses.service';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirInventoryData, EndUse } from '../../compressed-air-inventory';
import _ from 'lodash';

@Component({
  selector: 'app-end-uses-setup',
  templateUrl: './end-uses-setup.component.html',
  styleUrl: './end-uses-setup.component.css'
})
export class EndUsesSetupComponent implements OnInit {

  hasEndUses: boolean;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  selectedEndUseSubscription: Subscription;
  settings: Settings;
  compressedAirInventoryData: CompressedAirInventoryData;
  warnings: EndUseWarnings = { averageRequiredPressure: undefined, averageMeasuredPressure: undefined };

  constructor(private compressedAirInventoryService: CompressedAirInventoryService,
    private endUsesService: EndUsesService) { }

  ngOnInit(): void {
    this.initializeDefaultData();
    this.selectedEndUseSubscription = this.endUsesService.selectedEndUse.subscribe(selectedEndUse => {
      if (selectedEndUse) {
        this.hasEndUses = true;
        this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
        if (this.isFormChange == false) {
          this.warnings = this.endUsesService.checkEndUseWarnings(selectedEndUse);
          this.form = this.endUsesService.getEndUseFormFromObj(selectedEndUse, this.compressedAirInventoryData.endUses);
        } else {
          this.isFormChange = false;
        }
      } else {
        this.hasEndUses = false;
      }
    });

  }

  ngOnDestroy() {
    this.selectedEndUseSubscription.unsubscribe();
  }

  setEndUseName() {
    this.form = this.endUsesService.setEndUseNameValidators(this.form, this.compressedAirInventoryData.endUses)
    this.save();
  }

  save(endUse?: EndUse) {
    if (!endUse) {
      endUse = this.endUsesService.getEndUseFromFrom(this.form);
    }
    this.isFormChange = true;
    this.warnings = this.endUsesService.checkEndUseWarnings(endUse);
    let updated: UpdatedEndUseData = this.endUsesService.updateCompressedAirEndUse(endUse, this.compressedAirInventoryData, this.settings);
    this.compressedAirInventoryData = updated.compressedAirInventoryData;
    this.compressedAirInventoryService.compressedAirInventoryData.next(updated.compressedAirInventoryData);
    this.endUsesService.selectedEndUse.next(updated.endUse);
  }

  initializeDefaultData() {
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.hasEndUses = this.compressedAirInventoryData.endUses && this.compressedAirInventoryData.endUses.length !== 0;
    if (this.hasEndUses) {
      let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
      if (selectedEndUse) {
        let endUseExists: EndUse = this.compressedAirInventoryData.endUses.find(endUse => { return endUse.endUseId == selectedEndUse.endUseId });
        if (!endUseExists) {
          this.setLastUsedEndUse();
        }
      } else {
        this.setLastUsedEndUse();
      }
    }
  }

  setLastUsedEndUse() {
    let lastItemModified: EndUse = _.maxBy(this.compressedAirInventoryData.endUses, 'modifiedDate');
    this.endUsesService.selectedEndUse.next(lastItemModified);
  }

  addEndUse() {
    let newEndUse: UpdatedEndUseData = this.endUsesService.addToInventory(this.compressedAirInventoryData, this.settings);
    this.compressedAirInventoryData = newEndUse.compressedAirInventoryData;
    //this.compressedAirInventoryService.updateCompressedAirItem(newEndUse.compressedAirInventoryData.);
    this.endUsesService.selectedEndUse.next(newEndUse.endUse);
    this.hasEndUses = true;
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }




}
