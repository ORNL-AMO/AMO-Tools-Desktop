import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { Settings } from '../../shared/models/settings';
import { PsatTabService } from '../psat-tab.service';
import { PsatWarningService } from '../psat-warning.service';
@Component({
  selector: 'app-psat-tabs',
  templateUrl: './psat-tabs.component.html',
  styleUrls: ['./psat-tabs.component.css']
})
export class PsatTabsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;

  currentTab: string;
  calcTab: string;
  mainTab: string;
  modSubscription: Subscription;
  selectedModification: PSAT;
  secondarySub: Subscription;
  calcSub: Subscription;
  mainSub: Subscription;
  getResultsSub: Subscription;
  stepTab: String;
  stepTabSub: Subscription;
  settingsClassStatus: Array<string>;
  pumpFluidClassStatus: Array<string>;
  motorClassStatus: Array<string>;
  fieldDataClassStatus: Array<string>;
  constructor(private psatService: PsatService, private psatWarningService: PsatWarningService, private psatTabService: PsatTabService, private compareService: CompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.secondarySub = this.psatTabService.secondaryTab.subscribe(val => {
      this.currentTab = val;
    })
    this.calcSub = this.psatTabService.calcTab.subscribe(val => {
      this.calcTab = val;
    })
    this.mainSub = this.psatTabService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })

    this.getResultsSub = this.psatService.getResults.subscribe(val => {
      this.checkSettingsStatus();
    })
    this.stepTabSub = this.psatTabService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkSettingsStatus();
    })
  }

  ngOnDestroy(){
    this.secondarySub.unsubscribe();
    this.calcSub.unsubscribe();
    this.mainSub.unsubscribe();
    this.modSubscription.unsubscribe();
  }

  changeTab(str: string) {
    this.psatTabService.secondaryTab.next(str);
  }

  changeCalcTab(str: string) {
    this.psatTabService.calcTab.next(str);
  }

  selectModification() {
    this.compareService.openModificationModal.next(true);
  }

  checkPumpFluid() {
    let tmpForm = this.psatService.getFormFromPsat(this.psat.inputs);
    let tmpBool = this.psatService.isPumpFluidFormValid(tmpForm);
    return !tmpBool;
  }

  checkMotor() {
    let tmpForm = this.psatService.getFormFromPsat(this.psat.inputs);
    //check both steps
    let tmpBoolMotor = this.psatService.isMotorFormValid(tmpForm);
    let tmpBoolPump = this.psatService.isPumpFluidFormValid(tmpForm);
    let test = tmpBoolMotor && tmpBoolPump;
    return !test;
  }

  changeSubTab(str: string) {
    if (str == 'motor') {
      let tmpBool = this.checkPumpFluid();
      if (!tmpBool == true) {
        this.psatTabService.stepTab.next(str);
      }
    } else if (str == 'field-data') {
      let tmpBool = this.checkMotor();
      if (!tmpBool == true) {
        this.psatTabService.stepTab.next(str);
      }
    } else {
      this.psatTabService.stepTab.next(str);
    }
  }

  showTooltip(){

  }
  
  hideTooltip(){

  }

  checkSettingsStatus(){
    if(this.stepTab == 'system-basics'){
      this.settingsClassStatus = ['active'];
    }else {
      this.settingsClassStatus = ['success'];
    }
  }

  checkPumpFluidStatus(){
    let pumpFluidValid: boolean = this.checkPumpFluid();
    let pumpFluidWarnings: { rpmError: string, temperatureError: string, pumpEfficiencyError: string } = this.psatWarningService.checkPumpFluidWarnings(this.psat, this.settings);
    let checkWarnings: boolean = this.psatWarningService;
    if(!pumpFluidValid){
      this.pumpFluidClassStatus = ['missing-data'];
    }else if(this.stepTab == 'pump-fluid'){
      this.pumpFluidClassStatus = ['active'];
    }else{

    }
  }

  checkMotorStatus(){
    if(this.stepTab == 'motor'){
      this.motorClassStatus = ['active'];
    }else{

    }
  }

  checkFieldDataSatus(){
    if(this.stepTab == 'field-data'){
      this.fieldDataClassStatus = ['active'];
    }else{

    }
  }
}
