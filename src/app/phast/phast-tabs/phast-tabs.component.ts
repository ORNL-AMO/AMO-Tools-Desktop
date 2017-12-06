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
  specTab: string;

  specTabs: Array<any> = [
    {
      name: 'Assessment Settings',
      value: 'system-basics'
    },{
      name: 'Operating Hours',
      value: 'operating-hours'
    },{
      name: 'Operating Costs',
      value: 'energy-costs'
    }
  ]
  constructor(private phastService: PhastService) { }

  ngOnInit() {
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

  changeSpecTab(str: string){
    this.phastService.specTab.next(str);
  }


}
