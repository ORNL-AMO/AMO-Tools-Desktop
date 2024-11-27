import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WaterAssessmentService, WaterSetupTabString } from '../water-assessment.service';

@Component({
  selector: 'app-results-panel',
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css'
})
export class ResultsPanelComponent {
  setupTabSub: Subscription;
  setupTab: WaterSetupTabString;
  panelTabSelect: WaterPanelTab = 'component-table';
  displayResults: boolean;
  displayComponentTable: boolean;

  constructor(private waterAssessmentService: WaterAssessmentService) { }

  ngOnInit(): void {
    this.setupTabSub = this.waterAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      if (this.setupTab !== 'system-basics' && this.setupTab !== 'waste-water-treatment') {
        this.panelTabSelect = 'component-table'
      } else if (this.setupTab === 'waste-water-treatment') {
        this.panelTabSelect = 'results'
      } else {
        this.panelTabSelect = 'help';
      }
    });

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
  }

  setTab(tab: WaterPanelTab) {
    this.panelTabSelect = tab;
  }
}

  export type WaterPanelTab = 'help' | 'component-table' | 'results';