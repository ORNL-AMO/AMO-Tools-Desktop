import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';

@Component({
  selector: 'app-waste-water-banner',
  templateUrl: './waste-water-banner.component.html',
  styleUrls: ['./waste-water-banner.component.css']
})
export class WasteWaterBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;



  mainTab: string;
  mainTabSub: Subscription;
  wasteWaterSub: Subscription;
  assessmentTabSub: Subscription;
  assessmentTab: string;
  isBaselineValid: boolean;
  selectedModificationIdSub: Subscription;
  selectedModification: WasteWaterData;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      if (val.baselineData.valid) {
        this.isBaselineValid = val.baselineData.valid.isValid;
      }
    });

    this.mainTabSub = this.wasteWaterService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.assessmentTabSub = this.wasteWaterService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });

    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(() => {
      this.selectedModification = this.wasteWaterService.getModificationFromId();
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
  }


  changeTab(str: string) {
    if (str == 'system-setup' || this.isBaselineValid) {
      this.wasteWaterService.mainTab.next(str);
    }
  }

  changeAssessmentTab(str: string) {
    this.wasteWaterService.assessmentTab.next(str);
  }

  selectModification() {
    this.wasteWaterService.showModificationListModal.next(true);
  }
}
