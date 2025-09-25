import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { EndUseResults, EndUsesService, EndUseWarnings, UpdatedEndUseData } from './end-uses.service';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem, EndUse } from '../../compressed-air-inventory';
import _ from 'lodash';
import { CompressedAirCatalogService } from '../compressed-air-catalog/compressed-air-catalog.service';

@Component({
  selector: 'app-end-uses-setup',
  templateUrl: './end-uses-setup.component.html',
  styleUrl: './end-uses-setup.component.css',
  standalone: false
})
export class EndUsesSetupComponent implements OnInit {

  hasEndUses: boolean;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  selectedEndUseSubscription: Subscription;
  settings: Settings;
  compressedAirInventoryData: CompressedAirInventoryData;
  compressedAirInventoryDataSub: Subscription;
  endUseResult: EndUseResults;
  selectedSystemIdSub: Subscription;
  selectedEndUse: EndUse;
  selectedEndUses: Array<EndUse>;
  warnings: EndUseWarnings = { averageRequiredPressure: undefined, averageMeasuredPressure: undefined };

  constructor(private compressedAirInventoryService: CompressedAirInventoryService,
    private endUsesService: EndUsesService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {    
    this.settings = this.compressedAirInventoryService.settings.getValue();

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(val => {
      this.compressedAirInventoryData = val;
      let selectedSystemId: string = this.compressedAirCatalogService.selectedSystemId.getValue();
      if (selectedSystemId) {
        let findSystem: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == selectedSystemId });        
        if (findSystem) {
          this.initializeDefaultData(findSystem);
        }
      }
    });

    this.selectedSystemIdSub = this.compressedAirCatalogService.selectedSystemId.subscribe(val => {
      if (!val) {
        this.compressedAirCatalogService.selectedSystemId.next(this.compressedAirInventoryData.systems[0].id);
      } else {
        let findSystem: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == val });
        if (findSystem) {
          let selectedEndUseItem: EndUse = this.endUsesService.selectedEndUse.getValue();
          this.selectedEndUses = findSystem.endUses;
          if (selectedEndUseItem) {
            let findItemInSystem: EndUse = findSystem.endUses.find(compressedAirItem => { return compressedAirItem.endUseId == selectedEndUseItem.endUseId });
            if (!findItemInSystem) {
              this.endUsesService.selectedEndUse.next(findSystem.endUses[0]);
            }
          } else {
            this.endUsesService.selectedEndUse.next(findSystem.endUses[0]);
          }
        } else {
          this.compressedAirCatalogService.selectedSystemId.next(this.compressedAirInventoryData.systems[0].id);
          this.endUsesService.selectedEndUse.next(this.compressedAirInventoryData.systems[0].endUses[0]);
        }
      }
    });

    this.selectedEndUseSubscription = this.endUsesService.selectedEndUse.subscribe(selectedEndUse => {
      if (selectedEndUse) {
        this.selectedEndUse = selectedEndUse;
        this.hasEndUses = true;
        this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
        if (this.isFormChange == false) {
          this.warnings = this.endUsesService.checkEndUseWarnings(selectedEndUse);
          this.form = this.endUsesService.getEndUseFormFromObj(selectedEndUse, this.selectedEndUses);
        } else {
          this.isFormChange = false;
        }
      } else {
        this.hasEndUses = false;
      }
      this.endUseResult = this.endUsesService.getEndUseResults(selectedEndUse, this.compressedAirInventoryData);
    });   

  }

  ngOnDestroy() {
    this.selectedEndUseSubscription.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
    this.selectedSystemIdSub.unsubscribe();
  }

  setEndUseName() {
    this.form = this.endUsesService.setEndUseNameValidators(this.form, this.selectedEndUses)
    this.save();
  }

  save(endUse?: EndUse) {
    if (!endUse) {
      endUse = this.endUsesService.getEndUseFromFrom(this.form);
    }
    this.isFormChange = true;
    this.warnings = this.endUsesService.checkEndUseWarnings(endUse);
    this.endUseResult = this.endUsesService.getEndUseResults(endUse, this.compressedAirInventoryData);
    let updated: UpdatedEndUseData = this.endUsesService.updateCompressedAirEndUse(endUse, this.compressedAirInventoryData, this.settings);
    this.compressedAirInventoryData = updated.compressedAirInventoryData;
    this.compressedAirInventoryService.compressedAirInventoryData.next(updated.compressedAirInventoryData);
    this.endUsesService.selectedEndUse.next(updated.endUse);
  }

  initializeDefaultData(findSystem: CompressedAirInventorySystem) {
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    //this.settings = this.compressedAirInventoryService.settings.getValue();
    this.hasEndUses = findSystem.endUses && findSystem.endUses.length !== 0;
    if (this.hasEndUses) {
      let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
      if (selectedEndUse) {
        let endUseExists: EndUse = findSystem.endUses.find(endUse => { return endUse.endUseId == selectedEndUse.endUseId });
        if (!endUseExists) {
          this.setLastUsedEndUse();
        }
      } else {
        this.setLastUsedEndUse();
      }
    }
  }

  setLastUsedEndUse() {
    let lastItemModified: EndUse = _.maxBy(this.selectedEndUses, 'modifiedDate');
    this.endUsesService.selectedEndUse.next(lastItemModified);
  }

  addEndUse() {
    let newEndUse: UpdatedEndUseData = this.endUsesService.addToInventory(this.compressedAirInventoryData, this.selectedEndUses);
    this.compressedAirInventoryData = newEndUse.compressedAirInventoryData;
    //this.compressedAirInventoryService.updateCompressedAirItem(newEndUse.compressedAirInventoryData);
    this.endUsesService.selectedEndUse.next(newEndUse.endUse);
    this.hasEndUses = true;
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }




}
