import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { StepTab, stepTabs } from '../tabs';
@Component({
  selector: 'app-phast-tabs',
  templateUrl: './phast-tabs.component.html',
  styleUrls: ['./phast-tabs.component.css']
})
export class PhastTabsComponent implements OnInit {

  currentTab: StepTab;
  stepTabs: Array<StepTab>;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.stepTabs = stepTabs;
    this.phastService.stepTab.subscribe(val => {
      this.currentTab = val;
    })
  }

  changeTab(stepNum: number){
    this.phastService.goToStep(stepNum);
  }

}
