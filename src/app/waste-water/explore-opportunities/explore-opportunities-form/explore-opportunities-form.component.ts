import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWater, WasteWaterData } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {

  modification: WasteWaterData;
  selectedModificationIdSub: Subscription;
  modifyOperatingCostsForm: UntypedFormGroup;
  constructor(private wasteWaterService: WasteWaterService, private formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if(val){
        this.modification = this.wasteWaterService.getModificationFromId();
      }       
    });
    this.initForms();
  }

  initForms() {
    this.modifyOperatingCostsForm = this.formBuilder.group({
      implementationCosts: [this.modification.operations.implementationCosts],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initForms();
      }
    }
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modificationIndex: number = wasteWater.modifications.findIndex(modification => { return modification.id == this.modification.id });
    wasteWater.modifications[modificationIndex] = this.modification;
    wasteWater.modifications[modificationIndex].operations.implementationCosts = this.modifyOperatingCostsForm.controls.implementationCosts.value;
    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  addNewMod() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.baselineData));
    modification.co2SavingsData.userEnteredModificationEmissions = modification.co2SavingsData.userEnteredBaselineEmissions; 
    modification.exploreOpportunities = true;
    modification.name = 'Scenario ' + (wasteWater.modifications.length + 1);
    modification.id = Math.random().toString(36).substr(2, 9);
    wasteWater.modifications.push(modification);
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.wasteWaterService.selectedModificationId.next(modification.id);
  }
}
