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

  modificationExists: boolean;
  modification: WasteWaterData;
  selectedModificationIdSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if(val){
        this.modificationExists = true;
        this.modification = this.wasteWaterService.getModificationFromId();
      } else {
        this.modificationExists = false;
      }
      
    });

    if(!this.modification.name){
      this.modification.name = "Scenario 1"
    }

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
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.baselineData));
    modification.exploreOpportunities = true;
    modification.name = 'Scenario ' + (wasteWater.modifications.length + 1);
    modification.id = Math.random().toString(36).substr(2, 9);
    wasteWater.modifications.push(modification);
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.wasteWaterService.selectedModificationId.next(modification.id);
  }
}
