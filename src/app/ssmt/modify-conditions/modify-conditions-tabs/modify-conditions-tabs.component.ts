import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { SsmtService } from '../../ssmt.service';
import { CompareService } from '../../compare.service';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { BoilerService } from '../../boiler/boiler.service';
import { TurbineService } from '../../turbine/turbine.service';
import { HeaderService } from '../../header/header.service';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {
  @Input()
  settings: Settings;

  modelTab: string;
  modelTabSubscription: Subscription;


  displayOperationsTooltip: boolean;
  operationsBadgeHover: boolean;
  operationsBadgeClass: Array<string>;

  displayBoilerToolTip: boolean;
  boilerBadgeHover: boolean;
  boilerBadgeClass: Array<string>;

  displayHeaderTooltip: boolean;
  headerBadgeHover: boolean;
  headerBadgeClass: Array<string>;

  displayTurbineTooltip: boolean;
  turbineBadgeHover: boolean;
  turbineBadgeClass: Array<string>;
  updateDataSub: Subscription;
  constructor(private ssmtService: SsmtService, private compareService: CompareService, private boilerService: BoilerService, private turbineService: TurbineService,
    private headerService: HeaderService) { }

  ngOnInit() {
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    })

    this.updateDataSub = this.ssmtService.updateData.subscribe(val => {
      this.setBadgeClass();
    })

    this.displayOperationsTooltip = false;
    this.operationsBadgeHover = false;

    this.displayBoilerToolTip = false;
    this.boilerBadgeHover = false;

    this.displayHeaderTooltip = false;
    this.headerBadgeHover = false;

    this.displayTurbineTooltip = false;
    this.turbineBadgeHover = false;
  }

  ngOnDestroy() {
    this.modelTabSubscription.unsubscribe();
    this.updateDataSub.unsubscribe();
  }

  changeModelTab(str: string) {
    this.ssmtService.steamModelTab.next(str);
  }

  setBadgeClass() {
    let baseline: SSMT = this.compareService.baselineSSMT;
    let modification: SSMT = this.compareService.modifiedSSMT;

    this.operationsBadgeClass = this.setOperationsBadgeClass(baseline, modification);
    this.boilerBadgeClass = this.setBoilerBadgeClass(baseline, modification);
    this.headerBadgeClass = this.setHeaderBadgeClass(baseline, modification);
    this.turbineBadgeClass = this.setTurbineBadgeClass(baseline, modification);
  }

  setOperationsBadgeClass(baseline: SSMT, modification?: SSMT) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest: boolean = true;
    //TODO:
    // let validBaselineTest = this.operationsService.isFanFieldDataValid(baseline.operations);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      //TODO:
      // validModTest = this.fanFieldDataService.isFanFieldDataValid(modification.operations);
      isDifferent = this.compareService.checkOperationsDifferent();
    }
    let inputError: boolean;
    //TODO:
    // let inputError = this.checkFieldDataWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  setBoilerBadgeClass(baseline: SSMT, modification?: SSMT) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.boilerService.isBoilerValid(baseline.boilerInput, this.settings);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.boilerService.isBoilerValid(modification.boilerInput, this.settings);
      isDifferent = this.compareService.checkBoilerDifferent();
    }
    let inputError: boolean;
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  setHeaderBadgeClass(baseline: SSMT, modification?: SSMT) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.headerService.isHeaderValid(baseline.headerInput, this.settings);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.headerService.isHeaderValid(modification.headerInput, this.settings);
      isDifferent = this.compareService.checkHeaderDifferent();
    }
    let inputError: boolean;
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  setTurbineBadgeClass(baseline: SSMT, modification?: SSMT) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.turbineService.isTurbineValid(baseline.turbineInput, baseline.headerInput, this.settings);
    let validModTest = true;
    let isDifferent = false;
    if (modification) {
      validModTest = this.turbineService.isTurbineValid(modification.turbineInput, modification.headerInput, this.settings);
      isDifferent = this.compareService.checkTurbinesDifferent();
    }
    let inputError: boolean;
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  showTooltip(badge: string) {
    if (badge === 'operations') {
      this.operationsBadgeHover = true;
    }
    else if (badge === 'boiler') {
      this.boilerBadgeHover = true;
    }
    else if (badge === 'header') {
      this.headerBadgeHover = true;
    }
    else if (badge === 'turbine') {
      this.turbineBadgeHover = true;
    }

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip(badge: string) {
    if (badge === 'operations') {
      this.operationsBadgeHover = false;
      this.displayOperationsTooltip = false;
    }
    else if (badge === 'boiler') {
      this.boilerBadgeHover = false;
      this.displayBoilerToolTip = false;
    }
    else if (badge === 'header') {
      this.headerBadgeHover = false;
      this.displayHeaderTooltip = false;
    }
    else if (badge === 'turbine') {
      this.turbineBadgeHover = false;
      this.displayTurbineTooltip = false;
    }
  }

  checkHover() {
    if (this.operationsBadgeHover) {
      this.displayOperationsTooltip = true;
    }
    else {
      this.displayOperationsTooltip = false;
    }
    if (this.boilerBadgeHover) {
      this.displayBoilerToolTip = true;
    }
    else {
      this.displayBoilerToolTip = false;
    }
    if (this.headerBadgeHover) {
      this.displayHeaderTooltip = true;
    }
    else {
      this.displayHeaderTooltip = false;
    }
    if (this.turbineBadgeHover) {
      this.displayTurbineTooltip = true;
    }
    else {
      this.displayTurbineTooltip = false;
    }
  }
}
