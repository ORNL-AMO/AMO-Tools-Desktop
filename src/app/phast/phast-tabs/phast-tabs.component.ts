import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { StepTab, stepTabs, specTabs } from '../tabs';
@Component({
  selector: 'app-phast-tabs',
  templateUrl: './phast-tabs.component.html',
  styleUrls: ['./phast-tabs.component.css']
})
export class PhastTabsComponent implements OnInit {
  //We use BehaviorSubjects for our step and spec tabs in phast.
  //Other components subscribe to these BehaviorSubjects 
  //when .next() is set they get those values and updates views
  currentTab: StepTab;
  stepTabs: Array<StepTab>;
  specTab: StepTab;
  specTabs: Array<StepTab>;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.specTabs = specTabs;
    this.stepTabs = stepTabs;
    //subscribe here, other components can also change the tabs.
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
