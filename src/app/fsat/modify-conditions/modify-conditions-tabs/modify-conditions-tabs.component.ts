import { Component, OnInit, Input } from '@angular/core';
import { ModifyConditionsService } from '../modify-conditions.service';
import { Subscription } from 'rxjs';
import { CompareService } from '../../compare.service';
import { FsatFluidService } from '../../fsat-fluid/fsat-fluid.service';
import { FanMotorService } from '../../fan-motor/fan-motor.service';
import { FanFieldDataService } from '../../fan-field-data/fan-field-data.service';
import { FanSetupService } from '../../fan-setup/fan-setup.service';
import { FSAT } from '../../../shared/models/fans';
import { FsatService } from '../../fsat.service';
import { FsatWarningService, FanFieldDataWarnings, FanMotorWarnings, FanOperationsWarnings } from '../../fsat-warning.service';
import { Settings } from '../../../shared/models/settings';
import { OperationsService } from '../../operations/operations.service';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {
  @Input()
  settings: Settings;

  modifyConditionsTab: string;
  modifyConditionsTabSub: Subscription;

  displayFanOperationsTooltip: boolean;
  fanOperationsBadgeHover: boolean;
  fanOperationsBadgeClass: string;


  displayFanMotorTooltip: boolean;
  fanMotorBadgeHover: boolean;
  fanMotorBadgeClass: string;

  displayFluidTooltip: boolean;
  fluidBadgeHover: boolean;
  fluidBadgeClass: string;

  displayFieldDataTooltip: boolean;
  fieldDataBadgeHover: boolean;
  fieldDataBadgeClass: string;

  displayFanSetupTooltip: boolean;
  fanSetupBadgeHover: boolean;
  fanSetupBadgeClass: string;

  updateDataSub: Subscription;
  constructor(private modifyConditionsService: ModifyConditionsService, private compareService: CompareService,
    private fsatFluidService: FsatFluidService, private fanMotorService: FanMotorService,
    private fanFieldDataService: FanFieldDataService, private fanSetupService: FanSetupService,
    private fsatService: FsatService, private fsatWarningService: FsatWarningService,    
    private fanOperationsService: OperationsService) { }

  ngOnInit() {
    this.modifyConditionsTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    });

    this.updateDataSub = this.fsatService.updateData.subscribe(val => {
      this.setBadgeClass();
    });

    this.displayFanMotorTooltip = false;
    this.fanMotorBadgeHover = false;

    this.displayFanOperationsTooltip = false;
    this.fanOperationsBadgeHover = false;

    this.displayFluidTooltip = false;
    this.fluidBadgeHover = false;

    this.displayFieldDataTooltip = false;
    this.fieldDataBadgeHover = false;

    this.displayFanSetupTooltip = false;
    this.fanSetupBadgeHover = false;
  }

  ngOnDestroy() {
    this.modifyConditionsTabSub.unsubscribe();
    this.updateDataSub.unsubscribe();
  }

  changeModTab(str: string) {
    this.modifyConditionsService.modifyConditionsTab.next(str);
  }

  setBadgeClass() {
    let baseline: FSAT = this.compareService.baselineFSAT;
    let modification: FSAT = this.compareService.modifiedFSAT;
    this.fluidBadgeClass = this.setFluidBadgeClass(baseline, modification);
    this.fanMotorBadgeClass = this.setFanMotorBadgeClass(baseline, modification);
    this.fieldDataBadgeClass = this.setFanFieldDataBadgeClass(baseline, modification);
    this.fanSetupBadgeClass = this.setFanSetupBadgeClass(baseline, modification);
    
    this.fanOperationsBadgeClass = this.setFanOperationsBadgeClass(baseline, modification);
  }

  setFanFieldDataBadgeClass(baseline: FSAT, modification?: FSAT) {
    let badgeStr: string = 'success';
    let validBaselineTest = this.fanFieldDataService.isFanFieldDataValid(baseline.fieldData);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.fanFieldDataService.isFanFieldDataValid(modification.fieldData);
      isDifferent = this.compareService.checkFanFieldDataDifferent();
    }
    let inputError = this.checkFieldDataWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  checkFieldDataWarnings() {
    let hasWarning: boolean = false;
    let baselineWarnings: FanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.compareService.baselineFSAT, this.settings, false);
    for (var key in baselineWarnings) {
      if (baselineWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedFSAT && !hasWarning) {
      let modifiedWarnings: FanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.compareService.modifiedFSAT, this.settings, true);
      for (var key in modifiedWarnings) {
        if (modifiedWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  setFanOperationsBadgeClass(baseline: FSAT, modification?: FSAT) {
    let badgeStr: string = 'success';
    let validBaselineTest = this.fanOperationsService.isOperationsDataValid(baseline.fsatOperations);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.fanOperationsService.isOperationsDataValid(modification.fsatOperations);
      isDifferent = this.compareService.checkFanOperationsDifferent();
    }
    let inputError = this.checkOperationsWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  checkOperationsWarnings() {
    let hasWarning: boolean = false;
    let baselineWarnings: FanOperationsWarnings = this.fsatWarningService.checkOperationsWarnings(this.compareService.baselineFSAT, this.settings, false);
    for (var key in baselineWarnings) {
      if (baselineWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedFSAT && !hasWarning) {
      let modifiedWarnings: FanOperationsWarnings = this.fsatWarningService.checkOperationsWarnings(this.compareService.modifiedFSAT, this.settings, true);
      for (var key in modifiedWarnings) {
        if (modifiedWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  setFluidBadgeClass(baseline: FSAT, modification?: FSAT) {
    let badgeStr: string = 'success';
    let validBaselineTest = this.fsatFluidService.isFanFluidValid(baseline.baseGasDensity, this.settings);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.fsatFluidService.isFanFluidValid(modification.baseGasDensity, this.settings);
      isDifferent = this.compareService.checkFluidDifferent();
    }
    //let inputError = this.checkFanFluidWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  // checkFanFluidWarnings() {
  //   let hasWarning: boolean = false;
  //   let baselineWarnings: FanFluidWarnings = this.fsatWarningService.checkFanFluidWarnings(this.compareService.baselineFSAT.baseGasDensity, this.settings);
  //   for (var key in baselineWarnings) {
  //     if (baselineWarnings[key] !== null) {
  //       hasWarning = true;
  //     }
  //   }
  //   if (this.compareService.modifiedFSAT && !hasWarning) {
  //     let modifiedWarnings: FanFluidWarnings = this.fsatWarningService.checkFanFluidWarnings(this.compareService.modifiedFSAT.baseGasDensity, this.settings);
  //     for (var key in modifiedWarnings) {
  //       if (modifiedWarnings[key] !== null) {
  //         hasWarning = true;
  //       }
  //     }
  //   }
  //   return hasWarning;
  // }

  setFanSetupBadgeClass(baseline: FSAT, modification?: FSAT) {
    let badgeStr: string = 'success';
    let validBaselineTest = this.fanSetupService.isFanSetupValid(baseline.fanSetup, false);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.fanSetupService.isFanSetupValid(modification.fanSetup, true);
      isDifferent = this.compareService.checkFanSetupDifferent(this.settings);
    }
    let inputError = this.checkFanSetupWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  checkFanSetupWarnings() {
    let hasWarning: boolean = false;
    let baselineWarnings: { fanSpeedError: string } = this.fsatWarningService.checkFanWarnings(this.compareService.baselineFSAT.fanSetup);
    for (var key in baselineWarnings) {
      if (baselineWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedFSAT && !hasWarning) {
      let modifiedWarnings: { fanSpeedError: string } = this.fsatWarningService.checkFanWarnings(this.compareService.modifiedFSAT.fanSetup);
      for (var key in modifiedWarnings) {
        if (modifiedWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  setFanMotorBadgeClass(baseline: FSAT, modification?: FSAT) {
    let badgeStr: string = 'success';
    let validBaselineTest = this.fanMotorService.isFanMotorValid(baseline.fanMotor);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.fanMotorService.isFanMotorValid(modification.fanMotor);
      isDifferent = this.compareService.checkFanMotorDifferent();
    }
    let inputError = this.checkMotorWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  checkMotorWarnings() {
    let hasWarning: boolean = false;
    let baselineWarnings: FanMotorWarnings = this.fsatWarningService.checkMotorWarnings(this.compareService.baselineFSAT, this.settings, false);
    for (var key in baselineWarnings) {
      if (baselineWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedFSAT && !hasWarning) {
      let modifiedWarnings: FanMotorWarnings = this.fsatWarningService.checkMotorWarnings(this.compareService.modifiedFSAT, this.settings, true);
      for (var key in modifiedWarnings) {
        if (modifiedWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }


  showTooltip(badge: string) {
    if (badge === 'fieldData') {
      this.fieldDataBadgeHover = true;
    }
    else if (badge === 'fanMotor') {
      this.fanMotorBadgeHover = true;
    }
    else if (badge === 'fanSetup') {
      this.fanSetupBadgeHover = true;
    }
    else if (badge === 'fsatFluid') {
      this.fluidBadgeHover = true;
    }
    else if (badge === 'operations') {
      this.fanOperationsBadgeHover = true;
    }

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip(badge: string) {
    if (badge === 'fieldData') {
      this.fieldDataBadgeHover = false;
      this.displayFieldDataTooltip = false;
    }
    else if (badge === 'fanMotor') {
      this.fanMotorBadgeHover = false;
      this.displayFanMotorTooltip = false;
    }
    else if (badge === 'fanSetup') {
      this.fanSetupBadgeHover = false;
      this.displayFanSetupTooltip = false;
    }
    else if (badge === 'fsatFluid') {
      this.fluidBadgeHover = false;
      this.displayFluidTooltip = false;
    }
    else if (badge === 'operations') {
      this.fanOperationsBadgeHover = false;
      this.displayFanOperationsTooltip = false;
    }
  }

  checkHover() {
    if (this.fieldDataBadgeHover) {
      this.displayFieldDataTooltip = true;
    }
    else {
      this.displayFieldDataTooltip = false;
    }
    if (this.fanMotorBadgeHover) {
      this.displayFanMotorTooltip = true;
    }
    else {
      this.displayFanMotorTooltip = false;
    }
    if (this.fanSetupBadgeHover) {
      this.displayFanSetupTooltip = true;
    }
    else {
      this.displayFanSetupTooltip = false;
    }
    if (this.fluidBadgeHover) {
      this.displayFluidTooltip = true;
    }
    else {
      this.displayFluidTooltip = false;
    }
    if (this.fanOperationsBadgeHover) {
      this.displayFanOperationsTooltip = true;
    }
    else {
      this.displayFanOperationsTooltip = false;
    }
  }

}
