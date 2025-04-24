import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { FanAnalysisService } from '../fan-analysis.service';

@Component({
    selector: 'app-help-and-results-panel',
    templateUrl: './help-and-results-panel.component.html',
    styleUrls: ['./help-and-results-panel.component.css'],
    standalone: false
})
export class HelpAndResultsPanelComponent implements OnInit {
  @Input()
  settings: Settings;

  tabSelect: string = 'help';
  stepTabSub: Subscription;
  stepTab: string;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.stepTabSub = this.fanAnalysisService.stepTab.subscribe(tab => {
      this.stepTab = tab;
      if (this.stepTab == 'gas-density') {
        this.tabSelect = 'results';
      } else if (this.tabSelect == 'results') {
        this.tabSelect = 'help';
      }
    });
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy() {
    this.stepTabSub.unsubscribe();
  }


}
