import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  containerHeight: number;

  modificationExists: boolean;
  selectedModificationIdSub: Subscription;
  smallScreenTab: string = 'form';

  constructor(private wasteWaterService: WasteWaterService, private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(selectedModificationId => {
      if (selectedModificationId) {
        let modification: WasteWaterData = this.wasteWaterService.getModificationFromId();
        if (modification) {
          this.modificationExists = true;
          this.notifyExploreOpps(modification);
        } else {
          this.modificationExists = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  addExploreOpp() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.baselineData));
    if (modification.co2SavingsData) { 
      modification.co2SavingsData.userEnteredModificationEmissions = modification.co2SavingsData.userEnteredBaselineEmissions; 
    }
    modification.exploreOpportunities = true;
    modification.name = 'Scenario ' + (wasteWater.modifications.length + 1);
    modification.id = Math.random().toString(36).substr(2, 9);
    wasteWater.modifications.push(modification);
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.wasteWaterService.selectedModificationId.next(modification.id);
  }


  notifyExploreOpps(modification: WasteWaterData) {
      if (modification && !modification.exploreOpportunities) {
        this.snackbarService.setSnackbarMessage('exploreOpportunities', 'info', 'long');
      }
  }


  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
