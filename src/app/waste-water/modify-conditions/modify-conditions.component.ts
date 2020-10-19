import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { CompareService, WasteWaterDifferent } from './compare.service';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  containerHeight: number;

  wasteWaterSub: Subscription;

  baselineSelected: boolean = false;
  modificationSelected: boolean = true;
  modificationExists: boolean;

  isModalOpen: boolean;
  isModalOpenSub: Subscription;

  selectedTab: string;
  selectedTabSub: Subscription;

  selectedModification: WasteWaterData;
  selectedModificationIdSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService, private compareService: CompareService) { }

  ngOnInit(): void {
    this.isModalOpenSub = this.wasteWaterService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });
    this.selectedTabSub = this.wasteWaterService.modifyConditionsTab.subscribe(val => {
      this.selectedTab = val;
    });
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(() => {
      this.selectedModification = this.wasteWaterService.getModificationFromId();
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.compareService.setWasteWaterDifferent(wasteWater.baselineData, this.selectedModification);
      this.modificationExists = (this.selectedModification != undefined);
      if (!this.modificationExists) {
        if (wasteWater.modifications.length != 0) {
          this.wasteWaterService.selectedModificationId.next(wasteWater.modifications[0].id);
        }
      }
    });

    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.compareService.setWasteWaterDifferent(val.baselineData, this.selectedModification);
    });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.selectedTabSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
  }


  showModificationList() {
    this.wasteWaterService.showModificationListModal.next(true);
  }

  addModification() {
    this.wasteWaterService.showAddModificationModal.next(true);
  }

  togglePanel(bool: boolean) {
    if (bool === this.baselineSelected) {
      this.baselineSelected = true;
      this.modificationSelected = false;
    }
    else if (bool === this.modificationSelected) {
      this.modificationSelected = true;
      this.baselineSelected = false;
    }
  }
}
