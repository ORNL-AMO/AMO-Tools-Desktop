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
  steamModelStatus: Array<string> = [];
  auxEquipmentStatus: Array<string> = [];
  designedEnergyStatus: Array<string> = [];
  meteredEnergyStatus: Array<string> = [];
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
    this.checkSteamModelStatus();
    this.checkSettingsStatus();
    this.checkAuxEquipmentStatus();
    this.checkDesignedEnergyStatus();
    this.checkMeteredEnergyStatus();
  }

  checkSteamModelStatus(){
    if(this.stepTab == 'steam-model'){
      this.steamModelStatus = ['active'];
    }else{
      this.steamModelStatus = [];
    }
  }

  checkSettingsStatus(){
    if(this.stepTab == 'system-basics'){
      this.settingsStatus = ['active'];
    }else{
      this.settingsStatus = [];
    }
  }

  checkAuxEquipmentStatus(){
    if(this.stepTab == 'aux-equipment'){
      this.auxEquipmentStatus = ['active'];
    }else{
      this.auxEquipmentStatus = [];
    }
  }

  checkDesignedEnergyStatus(){
    if(this.stepTab == 'designed-energy'){
      this.designedEnergyStatus = ['active'];
    }else{
      this.designedEnergyStatus = [];
    }
  }

  checkMeteredEnergyStatus(){
    if(this.stepTab == 'metered-energy'){
      this.meteredEnergyStatus = ['active'];
    }else{
      this.meteredEnergyStatus = [];
    }
  }
}
