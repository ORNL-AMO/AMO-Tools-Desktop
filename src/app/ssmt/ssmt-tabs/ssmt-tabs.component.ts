import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-ssmt-tabs',
  templateUrl: './ssmt-tabs.component.html',
  styleUrls: ['./ssmt-tabs.component.css']
})
export class SsmtTabsComponent implements OnInit {

  mainTab:string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  assessmentTab: string;
  assessmentTabSubscrption: Subscription;
  modelTab:string;
  modelTabSubscription: Subscription;

  settingsStatus: Array<string> = [];
  operationsTabStatus: Array<string> = [];
  boilerTabStatus: Array<string> = [];
  headerTabStatus: Array<string> = [];
  turbineTabStatus: Array<string> = [];
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.checkStepTabStatus();
    })
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkStepTabStatus();
    })
    this.assessmentTabSubscrption = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
      this.checkStepTabStatus();
    })
  }

  ngOnDestroy(){
    this.assessmentTabSubscrption.unsubscribe();
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
  }

  changeAssessmentTab(str: string){
    this.ssmtService.assessmentTab.next(str);
  }

  changeStepTab(str: string){
    this.ssmtService.stepTab.next(str);
  }

  changeModelTab(str: string){
    this.ssmtService.steamModelTab.next(str);
  }

  checkStepTabStatus(){
    this.checkOperationsStatus();
    this.checkSettingsStatus();
    this.checkBoilerStatus();
    this.checkHeaderStatus();
    this.checkTurbineStatus();
  }

  checkOperationsStatus(){
    if(this.stepTab == 'operations'){
      this.operationsTabStatus = ['active'];
    }else{
      this.operationsTabStatus = [];
    }
  }

  checkSettingsStatus(){
    if(this.stepTab == 'system-basics'){
      this.settingsStatus = ['active'];
    }else{
      this.settingsStatus = [];
    }
  }

  checkBoilerStatus(){
    if(this.stepTab == 'boiler'){
      this.boilerTabStatus = ['active'];
    }else{
      this.boilerTabStatus = [];
    }
  }

  checkHeaderStatus(){
    if(this.stepTab == 'header'){
      this.headerTabStatus = ['active'];
    }else{
      this.headerTabStatus = [];
    }
  }

  checkTurbineStatus(){
    if(this.stepTab == 'turbine'){
      this.turbineTabStatus = ['active'];
    }else{
      this.turbineTabStatus = [];
    }
  }
}
