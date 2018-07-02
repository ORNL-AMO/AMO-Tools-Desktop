import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FsatService } from '../fsat.service';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { FSAT } from '../../shared/models/fans';
import { FsatFluidService } from '../fsat-fluid/fsat-fluid.service';
import { FanMotorService } from '../fan-motor/fan-motor.service';
import { FanFieldDataService } from '../fan-field-data/fan-field-data.service';
import { FanSetupService } from '../fan-setup/fan-setup.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';

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

  settingsValid: boolean = true;
  fluidValid: boolean;
  fanValid: boolean;
  motorValid: boolean;
  fieldDataValid: boolean;

  modifyConditionsTabSub: Subscription;
  modifyConditionsTab: string;
  constructor(private fsatService: FsatService, private compareService: CompareService, private cd: ChangeDetectorRef,
    private fsatFluidService: FsatFluidService,
    private fanMotorService: FanMotorService,
    private fanFieldDataService: FanFieldDataService,
    private fanSetupService: FanSetupService,
    private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkValid();
    })

    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })

    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })

    this.updateDataSub = this.fsatService.updateData.subscribe(val => {
      this.checkValid();
    })

    this.modifyConditionsTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.modSubscription.unsubscribe();
    this.updateDataSub.unsubscribe();
    this.modifyConditionsTabSub.unsubscribe();
  }

  changeStepTab(str: string) {
    if (str == 'fan-setup') {
      if (!this.fanDisabled) {
        this.fsatService.stepTab.next(str);
      }
    } else if (str == 'fan-motor') {
      if (!this.motorDisabled) {
        this.fsatService.stepTab.next(str);
      }
    } else if (str == 'fan-field-data') {
      if (!this.fieldDataDisabled) {
        this.fsatService.stepTab.next(str);
      }
    } else {
      this.fsatService.stepTab.next(str);
    }
  }

  changeAssessmentTab(str: string) {
    this.fsatService.assessmentTab.next(str);
  }

  selectModification() {
    this.fsatService.openModificationModal.next(true);
  }

  checkValid() {
    let baseline: FSAT = this.compareService.baselineFSAT;
    this.checkFluidValid(baseline);
    this.checkFanValid(baseline);
    this.checkMotorValid(baseline);
    this.checkFieldDataValid(baseline);
    this.checkDisabled(baseline);
  }

  checkDisabled(fsat: FSAT) {
    let baseline: FSAT = this.compareService.baselineFSAT;
    if (baseline) {
      this.fanDisabled = !this.fluidValid;
      this.motorDisabled = !this.fluidValid || !this.fanValid;
      this.fieldDataDisabled = !this.fluidValid || !this.fanValid && !this.motorValid;
    }
  }

  checkFluidValid(fsat: FSAT) {
    this.fluidValid = this.fsatFluidService.isFanFluidValid(fsat.baseGasDensity);
  }

  checkFanValid(fsat: FSAT) {
    this.fanValid = this.fanSetupService.isFanSetupValid(fsat.fanSetup);
  }

  checkMotorValid(fsat: FSAT) {
    this.motorValid = this.fanMotorService.isFanMotorValid(fsat.fanMotor);
  }

  checkFieldDataValid(fsat: FSAT) {
    this.fieldDataValid = this.fanFieldDataService.isFanFieldDataValid(fsat.fieldData);
  }
}
