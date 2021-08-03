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
  constructor(private compressedAirService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    let mainTab: string = this.compressedAirService.mainTab.getValue();
    if (mainTab == 'system-setup') {
      this.selectedTabSub = this.compressedAirService.setupTab.subscribe(val => {
        this.selectedTab = val;
      });
    }
  }

  ngOnDestroy() {
    if (this.selectedTabSub) this.selectedTabSub.unsubscribe();
  }

}
