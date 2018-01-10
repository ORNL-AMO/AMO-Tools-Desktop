import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { StepTab, stepTabs, specTabs } from '../tabs';
@Component({
  selector: 'app-phast-tabs',
  templateUrl: './phast-tabs.component.html',
  styleUrls: ['./phast-tabs.component.css']
})
export class PhastTabsComponent implements OnInit {

  currentTab: StepTab;
  stepTabs: Array<StepTab>;
  specTab: StepTab;
  specTabs: Array<StepTab>;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.specTabs = specTabs;
    this.stepTabs = stepTabs;
    this.phastService.stepTab.subscribe(val => {
      this.currentTab = val;
    })
    this.phastService.specTab.subscribe(val => {
      this.specTab = val;
    })
  }

  changeTab(stepNum: number){
    this.phastService.goToStep(stepNum);
  }

  changeSpecTab(tab: StepTab){
    this.phastService.specTab.next(tab);
  }


}
