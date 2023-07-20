import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { StepTab, stepTabs, specTabs } from '../tabs';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
@Component({
  selector: 'app-phast-tabs',
  templateUrl: './phast-tabs.component.html',
  styleUrls: ['./phast-tabs.component.css']
})
export class PhastTabsComponent implements OnInit {
  //We use BehaviorSubjects for our step and spec tabs in phast.
  //Other components subscribe to these BehaviorSubjects 
  //when .next() is set they get those values and updates views

  @Input()
  tab1Status: string;
  @Input()
  tab2Status: string;
  @Input()
  assessment: Assessment;

  currentTab: StepTab;
  stepTabs: Array<StepTab>;
  specTab: StepTab;
  specTabs: Array<StepTab>;
  badge1Hover: boolean;
  badge2Hover: boolean;
  display1: boolean;
  display2: boolean;

  specTabSub: Subscription;
  currentTabSub: Subscription;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.specTabs = specTabs;
    this.stepTabs = stepTabs;
    //subscribe here, other components can also change the tabs.
    this.specTabSub = this.phastService.stepTab.subscribe(val => {
      this.currentTab = val;
    });
    this.currentTabSub = this.phastService.specTab.subscribe(val => {
      this.specTab = val;
    });

    this.badge1Hover = false;
    this.badge2Hover = false;
  }

  ngOnDestroy(){
    this.specTabSub.unsubscribe();
    this.currentTabSub.unsubscribe();
  }

  changeTab(stepNum: number) {
    this.phastService.goToStep(stepNum);
  }

  changeSpecTab(tab: StepTab) {
    this.phastService.specTab.next(tab);
  }


  showTooltip(num: number) {
    if (num === 1) {
      this.badge1Hover = true;
    }
    else if (num === 2) {
      this.badge2Hover = true;
    }

    setTimeout(() => {
      this.checkHover(num);
    }, 1000);
  }

  hideTooltip(num: number) {
    if (num === 1) {
      this.badge1Hover = false;
      this.display1 = false;
    }
    else if (num === 2) {
      this.badge2Hover = false;
      this.display2 = false;
    }
  }

  checkHover(num: number) {
    if (num === 1) {
      if (this.badge1Hover) {
        this.display1 = true;
      }
      else {
        this.display1 = false;
      }
    }
    else if (num === 2) {
      if (this.badge2Hover) {
        this.display2 = true;
      }
      else {
        this.display2 = false;
      }
    }
    
  }

  getCanContinue(): boolean {
    if (this.currentTab.step == 5) {
      return this.assessment.phast.setupDone;
    } else {
      return true;
    }
  }

  continue() {
    this.phastService.continue();
  }

  back() {
    this.phastService.back();
  }

}
/*
[ngClass]="{'active': currentTab.step == tab.step
, 'input-error': (tab.step == 1 && tab1Status == 'input-error') || (tab.step == 2 && tab2Status == 'input-error')
, 'missing-data': (tab.step == 1 && tab1Status == 'missing-data') || (tab.step == 2 && tab2Status == 'missing-data')
, 'success': (tab.step == 1 && tab1Status == 'success') || (tab.step == 2 && tab2Status == 'success')}">
*/ 