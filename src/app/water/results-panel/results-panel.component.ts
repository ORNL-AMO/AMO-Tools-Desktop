import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WaterAssessmentService, WaterSetupTabString } from '../water-assessment.service';
import { WaterSystemComponentService } from '../water-system-component.service';
import { Settings } from '../../shared/models/settings';
import { ProcessFlowNodeType } from 'process-flow-lib';

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
  selectedComponentSub: Subscription;
  selectedComponentType: ProcessFlowNodeType;
  settings: Settings;
  constructor(private waterAssessmentService: WaterAssessmentService,
    private waterSystemComponentService: WaterSystemComponentService
  ) { }

  ngOnInit(): void {
    this.settings = this.waterAssessmentService.settings.getValue();

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

    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(component => {
      if (component) {
        this.selectedComponentType = component.processComponentType;
      }
    });


  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.selectedComponentSub.unsubscribe();
  }

  setTab(tab: WaterPanelTab) {
    this.panelTabSelect = tab;
  }
}

  export type WaterPanelTab = 'help' | 'component-table' | 'results';