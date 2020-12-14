import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../waste-water.service';

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
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if (val) {
        this.modificationExists = true;
      } else {
        this.modificationExists = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  addExploreOpp() {
    this.wasteWaterService.showAddModificationModal.next(true);
  }
}
