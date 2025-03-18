import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../waste-water.service';

@Component({
    selector: 'app-help-panel',
    templateUrl: './help-panel.component.html',
    styleUrls: ['./help-panel.component.css'],
    standalone: false
})
export class HelpPanelComponent implements OnInit {

  selectedTab: string;
  selectedTabSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    let mainTab: string = this.wasteWaterService.mainTab.getValue();
    if (mainTab == 'system-setup') {
      this.selectedTabSub = this.wasteWaterService.setupTab.subscribe(val => {
        this.selectedTab = val;
      });
    } else if (mainTab == 'assessment') {
      this.selectedTabSub = this.wasteWaterService.modifyConditionsTab.subscribe(val => {
        this.selectedTab = val;
      });
    }
  }

  ngOnDestroy() {
    if (this.selectedTabSub) this.selectedTabSub.unsubscribe();
  }

}
