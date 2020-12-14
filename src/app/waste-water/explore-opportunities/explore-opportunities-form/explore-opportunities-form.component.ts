import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWater, WasteWaterData } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {

  modification: WasteWaterData;
  selectedModificationIdSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      this.modification = this.wasteWaterService.getModificationFromId();
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modificationIndex: number = wasteWater.modifications.findIndex(modification => { return modification.id == this.modification.id });
    wasteWater.modifications[modificationIndex] = this.modification;
    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  addNewMod() {
    this.wasteWaterService.showAddModificationModal.next(true);
  }
}
