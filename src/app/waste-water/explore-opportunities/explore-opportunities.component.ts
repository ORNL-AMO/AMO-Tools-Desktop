import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  containerHeight: number;
  @Output('exploreOppsToast')
  exploreOppsToast: EventEmitter<boolean> = new EventEmitter<boolean>();

  modificationExists: boolean;
  selectedModificationIdSub: Subscription;

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if (val) {
        this.modificationExists = true;
      } else {
        this.modificationExists = false;
      }
      this.checkExploreOpps();
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  addExploreOpp() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.baselineData));
    modification.exploreOpportunities = true;
    modification.name = 'Scenario ' + (wasteWater.modifications.length + 1);
    modification.id = Math.random().toString(36).substr(2, 9);
    wasteWater.modifications.push(modification);
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.wasteWaterService.selectedModificationId.next(modification.id);
  }


  checkExploreOpps() {
    if (this.modificationExists) {
      let modification: WasteWaterData = this.wasteWaterService.getModificationFromId();
      if (!modification.exploreOpportunities) {
        let title: string = 'Explore Opportunities';
        let body: string = 'The selected modification was created using the expert view. There may be changes to the modification that are not visible from this screen.';
        this.openToast(title, body);
        this.exploreOppsToast.emit(false);
      }else if(this.showToast){
        this.hideToast();
      }
    }
  }

  openToast(title: string, body: string) {
    this.toastData.title = title;
    this.toastData.body = body;
    this.showToast = true;
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    }
  }
}
