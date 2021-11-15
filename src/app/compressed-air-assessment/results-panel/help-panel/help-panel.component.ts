import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {

  selectedTab: string;
  selectedTabSub: Subscription;
  assessmentTab: string;
  assessmentTabSub: Subscription;

  mainTab: string;
  constructor(private compressedAirService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.mainTab = this.compressedAirService.mainTab.getValue();
    if (this.mainTab == 'system-setup') {
      this.selectedTabSub = this.compressedAirService.setupTab.subscribe(val => {
        this.selectedTab = val;
      });
    } else if (this.mainTab == 'assessment') {
      this.assessmentTabSub = this.compressedAirService.assessmentTab.subscribe(val => {
        this.assessmentTab = val;
      });
    }
  }

  ngOnDestroy() {
    if (this.selectedTabSub) this.selectedTabSub.unsubscribe();
    if (this.assessmentTabSub) this.assessmentTabSub.unsubscribe();
  }

}
