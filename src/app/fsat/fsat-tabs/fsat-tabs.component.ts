import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FsatService } from '../fsat.service';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { FSAT } from '../../shared/models/fans';
import { FsatFluidService } from '../fsat-fluid/fsat-fluid.service';
import { FanMotorService } from '../fan-motor/fan-motor.service';
import { FanFieldDataService } from '../fan-field-data/fan-field-data.service';
import { FanSetupService } from '../fan-setup/fan-setup.service';

@Component({
  selector: 'app-fsat-tabs',
  templateUrl: './fsat-tabs.component.html',
  styleUrls: ['./fsat-tabs.component.css']
})
export class FsatTabsComponent implements OnInit {

  mainTab: string;
  stepTab: string;
  assessmentTab: string;
  mainTabSub: Subscription;
  stepTabSub: Subscription;
  assessmentTabSub: Subscription;
  modSubscription: Subscription;
  selectedModification: FSAT;

  fanDisabled: boolean;
  motorDisabled: boolean;
  fieldDataDisabled: boolean;
  updateDataSub: Subscription;
  constructor(private fsatService: FsatService, private compareService: CompareService, private cd: ChangeDetectorRef,
    private fsatFluidService: FsatFluidService,
    private fanMotorService: FanMotorService,
    private fanFieldDataService: FanFieldDataService,
    private fanSetupService: FanSetupService) { }

  ngOnInit() {
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkDisabled();
    })

    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })

    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })

    this.updateDataSub = this.fsatService.updateData.subscribe(val => {
      this.checkDisabled();
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.modSubscription.unsubscribe();
    this.updateDataSub.unsubscribe();
  }

  changeStepTab(str: string) {
    if(str == 'fan-setup'){
      if(this.fanDisabled){
        this.fsatService.stepTab.next(str);
      }
    }else if(str == 'fan-motor'){
      if(this.motorDisabled){
        this.fsatService.stepTab.next(str);
      }
    }else if(str == 'fan-field-data'){
      if(this.fieldDataDisabled){
        this.fsatService.stepTab.next(str);
      }
    }else{
      this.fsatService.stepTab.next(str);
    }
  }

  changeAssessmentTab(str: string) {
    this.fsatService.assessmentTab.next(str);
  }

  selectModification() {
    this.fsatService.openModificationModal.next(true);
  }

  checkDisabled() {
    let baseline: FSAT = this.compareService.baselineFSAT;
    if (baseline) {
      let isValid: boolean = this.fsatFluidService.isFanFluidValid(baseline.baseGasDensity);
      this.fanDisabled = isValid;
      isValid = this.fanSetupService.isFanSetupValid(baseline.fanSetup);
      this.motorDisabled = this.fanDisabled && isValid;
      isValid = this.fanMotorService.isFanMotorValid(baseline.fanMotor);
      this.fieldDataDisabled = this.fanDisabled && this.motorDisabled && isValid;
    }
  }
}
