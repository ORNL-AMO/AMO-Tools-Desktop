import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WaterAssessmentService, WaterSetupTabString, WaterUsingSystemTabString } from '../water-assessment.service';
import { WaterSystemComponentService } from '../water-system-component.service';
import { Settings } from '../../shared/models/settings';
import { ProcessFlowNodeType } from 'process-flow-lib';

@Component({
  selector: 'app-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css'
})
export class ResultsPanelComponent {
  setupTabSub: Subscription;
  waterUsingSystemTab: WaterUsingSystemTabString;
  setupTab: WaterSetupTabString;
  panelTabSelect: WaterPanelTab = 'component-table';
  displayResults: boolean;
  displayComponentTable: boolean;
  selectedComponentSub: Subscription;
  selectedComponentType: ProcessFlowNodeType;
  settings: Settings;
  waterUsingSystemTabSub: Subscription;
  showResultsContext: WaterSetupTabString[] = ['water-using-system', 'water-intake', 'water-discharge'];
  constructor(private waterAssessmentService: WaterAssessmentService,
    private waterSystemComponentService: WaterSystemComponentService
  ) { }

  ngOnInit(): void {
    this.settings = this.waterAssessmentService.settings.getValue();

    this.setupTabSub = this.waterAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      if (this.setupTab !== 'water-using-system') {
        // * hide system treatment table
        this.waterAssessmentService.waterUsingSystemTab.next('system');
      } 

      if (this.setupTab !== 'system-basics') {
        this.panelTabSelect = 'component-table';
      } else {
        this.panelTabSelect = 'help';
      }

    });

    this.waterUsingSystemTabSub = this.waterAssessmentService.waterUsingSystemTab.subscribe(val => {
      this.waterUsingSystemTab = val;
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
    this.waterUsingSystemTabSub.unsubscribe();
  }

  setTab(tab: WaterPanelTab) {
    this.panelTabSelect = tab;
  }
}

  export type WaterPanelTab = 'help' | 'component-table' | 'results';