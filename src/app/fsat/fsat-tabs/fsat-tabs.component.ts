import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FsatService } from '../fsat.service';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { FSAT } from '../../shared/models/fans';
import { FsatFluidService } from '../fsat-fluid/fsat-fluid.service';
import { FanMotorService } from '../fan-motor/fan-motor.service';
import { FanFieldDataService } from '../fan-field-data/fan-field-data.service';
import { FanSetupService } from '../fan-setup/fan-setup.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';
import { Settings } from '../../shared/models/settings';
import { FsatWarningService, FanMotorWarnings, FanFieldDataWarnings } from '../fsat-warning.service';

@Component({
  selector: 'app-fsat-tabs',
  templateUrl: './fsat-tabs.component.html',
  styleUrls: ['./fsat-tabs.component.css']
})
export class FsatTabsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;


  settingsClassStatus: Array<string> = [];
  fanClassStatus: Array<string> = [];
  fluidClassStatus: Array<string> = [];
  motorClassStatus: Array<string> = [];
  fieldDataClassStatus: Array<string> = [];
  fluidBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  motorBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  fieldDataBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  fanBadge: { display: boolean, hover: boolean } = { display: false, hover: false };

  mainTab: string;
  stepTab: string;
  assessmentTab: string;
  mainTabSub: Subscription;
  stepTabSub: Subscription;
  assessmentTabSub: Subscription;
  modSubscription: Subscription;
  selectedModification: FSAT;
  calcTab: string;
  calcTabSub: Subscription;

  updateDataSub: Subscription;
  modifyConditionsTabSub: Subscription;
  modifyConditionsTab: string;

  constructor(private fsatService: FsatService, private compareService: CompareService, private cd: ChangeDetectorRef,
    private fsatFluidService: FsatFluidService,
    private fanMotorService: FanMotorService,
    private fanFieldDataService: FanFieldDataService,
    private fanSetupService: FanSetupService,
    private modifyConditionsService: ModifyConditionsService,
    private fsatWarningService: FsatWarningService) { }

  ngOnInit() {
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkSettingsStatus();
      this.checkFanStatus();
      this.checkFluidStatus();
      this.checkMotorStatus();
      this.checkFieldDataSatus();
    })

    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })

    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })

    this.updateDataSub = this.fsatService.updateData.subscribe(val => {
      this.checkSettingsStatus();
      this.checkFanStatus();
      this.checkFluidStatus();
      this.checkMotorStatus();
      this.checkFieldDataSatus();
    })

    this.modifyConditionsTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    });
    this.calcTabSub = this.fsatService.calculatorTab.subscribe(val => {
      this.calcTab = val;
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.modSubscription.unsubscribe();
    this.updateDataSub.unsubscribe();
    this.modifyConditionsTabSub.unsubscribe();
    this.calcTabSub.unsubscribe();
  }

  changeStepTab(str: string) {
    let fluidValid: boolean = this.fsatFluidService.isFanFluidValid(this.fsat.baseGasDensity);
    let fanValid: boolean = this.fanSetupService.isFanSetupValid(this.fsat.fanSetup, false);
    let motorValid: boolean = this.fanMotorService.isFanMotorValid(this.fsat.fanMotor);
    if (str == 'fan-setup') {
      if (fluidValid) {
        this.fsatService.stepTab.next(str);
      }
    } else if (str == 'fan-motor') {
      if (fluidValid && fanValid) {
        this.fsatService.stepTab.next(str);
      }
    } else if (str == 'fan-field-data') {
      if (fluidValid && fanValid && motorValid) {
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


  checkSettingsStatus() {
    if (this.stepTab == 'system-basics') {
      this.settingsClassStatus = ['active', 'success'];
    } else {
      this.settingsClassStatus = ['success'];
    }
  }

  checkFluidStatus() {
    let fluidValid: boolean = this.fsatFluidService.isFanFluidValid(this.fsat.baseGasDensity);
    // let fanFluidWarnings: FanFluidWarnings = this.fsatWarningService.checkFanFluidWarnings(this.fsat.baseGasDensity, this.settings);
    // let checkWarnings: boolean = this.fsatWarningService.checkWarningsExist(fanFluidWarnings);
    if (!fluidValid) {
      this.fluidClassStatus = ['missing-data'];
    } else {
      this.fluidClassStatus = ['success'];
    }
    if (this.stepTab == 'fsat-fluid') {
      this.fluidClassStatus.push('active');
    }
  }

  checkFanStatus() {
    let fluidValid: boolean = this.fsatFluidService.isFanFluidValid(this.fsat.baseGasDensity);
    let fanValid: boolean = this.fanSetupService.isFanSetupValid(this.fsat.fanSetup, false);
    let warnings: { fanSpeedError: string } = this.fsatWarningService.checkFanWarnings(this.fsat.fanSetup);
    let checkWarnings: boolean = this.fsatWarningService.checkWarningsExist(warnings);
    if (!fluidValid) {
      this.fanClassStatus = ['disabled'];
    } else if (!fanValid) {
      this.fanClassStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.fanClassStatus = ['input-error'];
    } else {
      this.fanClassStatus = ['success'];
    }
    if (this.stepTab == 'fan-setup') {
      this.fanClassStatus.push('active');
    }
  }

  checkMotorStatus() {
    let fluidValid: boolean = this.fsatFluidService.isFanFluidValid(this.fsat.baseGasDensity);
    let fanValid: boolean = this.fanSetupService.isFanSetupValid(this.fsat.fanSetup, false);
    let motorValid: boolean = this.fanMotorService.isFanMotorValid(this.fsat.fanMotor);
    let motorWarnings: FanMotorWarnings = this.fsatWarningService.checkMotorWarnings(this.fsat, this.settings);
    let checkWarnings: boolean = this.fsatWarningService.checkWarningsExist(motorWarnings);
    if (!fluidValid || !fanValid) {
      this.motorClassStatus = ['disabled'];
    } else if (!motorValid) {
      this.motorClassStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.motorClassStatus = ['input-error'];
    } else {
      this.motorClassStatus = ['success'];
    }
    if (this.stepTab == 'fan-motor') {
      this.motorClassStatus.push('active');
    }
  }

  checkFieldDataSatus() {
    let fluidValid: boolean = this.fsatFluidService.isFanFluidValid(this.fsat.baseGasDensity);
    let fanValid: boolean = this.fanSetupService.isFanSetupValid(this.fsat.fanSetup, false);
    let motorValid: boolean = this.fanMotorService.isFanMotorValid(this.fsat.fanMotor);
    let fieldDataValid: boolean = this.fanFieldDataService.isFanFieldDataValid(this.fsat.fieldData);
    let fieldDataWarnings: FanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings);
    let checkWarnings: boolean = this.fsatWarningService.checkWarningsExist(fieldDataWarnings);
    if (!fluidValid || !motorValid || !fanValid) {
      this.fieldDataClassStatus = ['disabled'];
    } else if (!fieldDataValid) {
      this.fieldDataClassStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.fieldDataClassStatus = ['input-error'];
    } else {
      this.fieldDataClassStatus = ['success'];
    }
    if (this.stepTab == 'fan-field-data') {
      this.fieldDataClassStatus.push('active');
    }
  }

  changeCalcTab(str: string) {
    this.fsatService.calculatorTab.next(str);
  }

  showTooltip(badge: { display: boolean, hover: boolean }) {
    badge.hover = true;
    setTimeout(() => {
      this.checkHover(badge);
    }, 1000);
  }

  hideTooltip(badge: { display: boolean, hover: boolean }) {
    badge.hover = false;
    badge.display = false;
  }

  checkHover(badge: { display: boolean, hover: boolean }) {
    if (badge.hover) {
      badge.display = true;
    } else {
      badge.display = false;
    }
  }
}
