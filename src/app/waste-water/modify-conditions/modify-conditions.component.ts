import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';

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
  modificationExists: boolean;

  isModalOpen: boolean;
  isModalOpenSub: Subscription;

  selectedTab: string;
  selectedTabSub: Subscription;

  selectedModification: WasteWaterData;
  selectedModificationIdSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.isModalOpenSub = this.wasteWaterService.isModalOpen.subscribe(val => {
      this.isModalOpen = val;
    });
    this.selectedTabSub = this.wasteWaterService.modifyConditionsTab.subscribe(val => {
      this.selectedTab = val;
    });
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(() => {
      this.selectedModification = this.wasteWaterService.getModificationFromId();
      this.modificationExists = (this.selectedModification != undefined);
    });
  }

  ngOnDestroy() {
    this.isModalOpenSub.unsubscribe();
    this.selectedTabSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
  }


  showModificationList() {
    this.wasteWaterService.showModificationListModal.next(true);
  }

  addModification() {
    this.wasteWaterService.showAddModificationModal.next(true);
  }

  togglePanel() {
    this.baselineSelected = !this.baselineSelected;
  }
}
