import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingService } from '../../process-cooling.service';

@Component({
  selector: 'app-help-panel',
  standalone: false,
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css'
})
export class HelpPanelComponent {
  selectedTab: string;
  selectedTabSub: Subscription;
  assessmentTab: string;
  assessmentTabSub: Subscription;

  mainTab: string;
  constructor(private processCoolingService: ProcessCoolingService) { }

  ngOnInit(): void {
    this.mainTab = this.processCoolingService.mainTab.getValue();
    if (this.mainTab == 'baseline') {
      this.selectedTabSub = this.processCoolingService.setupTab.subscribe(val => {
        this.selectedTab = val;
      });
    } else if (this.mainTab == 'assessment') {
      // this.assessmentTabSub = this.processCoolingService.assessmentTab.subscribe(val => {
      //   this.assessmentTab = val;
      // });
    }
  }

  ngOnDestroy() {
    if (this.selectedTabSub) this.selectedTabSub.unsubscribe();
    if (this.assessmentTabSub) this.assessmentTabSub.unsubscribe();
  }
}