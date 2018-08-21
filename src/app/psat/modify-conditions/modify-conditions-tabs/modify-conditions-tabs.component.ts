import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompareService } from '../../compare.service';
import { PsatService } from '../../psat.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PsatWarningService, FieldDataWarnings, MotorWarnings } from '../../psat-warning.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {
  @Input()
  settings: Settings;

  displayPumpFluidTooltip: boolean;
  pumpFluidBadgeHover: boolean;
  displayMotorTooltip: boolean;
  motorBadgeHover: boolean;
  displayFieldDataTooltip: boolean;
  fieldDataBadgeHover: boolean;

  pumpFluidBadgeClass: Array<string>;
  motorBadgeClass: Array<string>;
  fieldDataBadgeClass: Array<string>;
  resultsSub: Subscription;
  modTabSub: Subscription;
  modifyTab: string;
  constructor(private compareService: CompareService, private psatService: PsatService, private psatWarningService: PsatWarningService) { }

  ngOnInit() {
    this.resultsSub = this.psatService.getResults.subscribe(val => {
      this.setBadgeClass();
    })

    this.modTabSub = this.psatService.modifyConditionsTab.subscribe(val => {
      this.modifyTab = val;
    })

    this.displayPumpFluidTooltip = false;
    this.pumpFluidBadgeHover = false;
    this.displayMotorTooltip = false;
    this.motorBadgeHover = false;
    this.displayFieldDataTooltip = false;
    this.fieldDataBadgeHover = false;
  }

  ngOnDestroy() {
    this.resultsSub.unsubscribe();
    this.modTabSub.unsubscribe();
  }

  setBadgeClass() {
    let tmpBaslineForm = this.psatService.getFormFromPsat(this.compareService.baselinePSAT.inputs);
    let tmpModForm;
    if (this.compareService.modifiedPSAT) {
      tmpModForm = this.psatService.getFormFromPsat(this.compareService.modifiedPSAT.inputs);
    }
    this.fieldDataBadgeClass = this.setFieldDataBadgeClass(tmpBaslineForm, tmpModForm);
    this.pumpFluidBadgeClass = this.setPumpFluidBadgeClass(tmpBaslineForm, tmpModForm);
    this.motorBadgeClass = this.setMotorBadgeClass(tmpBaslineForm, tmpModForm);
  }

  setFieldDataBadgeClass(baselineForm: FormGroup, modifiedForm?: FormGroup) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.psatService.isFieldDataFormValid(baselineForm);
    let validModTest = true;
    let isDifferent = false;
    if (modifiedForm) {
      validModTest = this.psatService.isFieldDataFormValid(modifiedForm)
      isDifferent = this.compareService.checkFieldDataDifferent();
    }
    let inputError = this.checkFieldDataInputError();
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  checkFieldDataInputError() {
    let hasWarning: boolean = false;
    let baselineFieldDataWarnings: FieldDataWarnings = this.psatWarningService.checkFieldData(this.compareService.baselinePSAT, this.settings, true);
    for (var key in baselineFieldDataWarnings) {
      if (baselineFieldDataWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedPSAT && !hasWarning) {
      let modifiedFieldDataWarnings: FieldDataWarnings = this.psatWarningService.checkFieldData(this.compareService.modifiedPSAT, this.settings);
      for (var key in modifiedFieldDataWarnings) {
        if (modifiedFieldDataWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  setPumpFluidBadgeClass(baselineForm: FormGroup, modifiedForm?: FormGroup) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.psatService.isPumpFluidFormValid(baselineForm);
    let validModTest = true;
    let isDifferent = false;
    if (modifiedForm) {
      validModTest = this.psatService.isPumpFluidFormValid(modifiedForm)
      isDifferent = this.compareService.checkPumpDifferent();
    }
    let inputError = false;
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  setMotorBadgeClass(baselineForm: FormGroup, modifiedForm?: FormGroup) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.psatService.isMotorFormValid(baselineForm);
    let inputError = this.checkMotorInputError();
    let validModTest = true;
    let isDifferent = false;
    if (modifiedForm) {
      validModTest = this.psatService.isMotorFormValid(modifiedForm)
      isDifferent = this.compareService.checkMotorDifferent();
    }
    if (!validBaselineTest || !validModTest) {
      badgeStr = ['missing-data'];
    } else if (inputError) {
      badgeStr = ['input-error'];
    } else if (isDifferent) {
      badgeStr = ['loss-different'];
    }
    return badgeStr;
  }

  checkMotorInputError() {
    let hasWarning: boolean = false;
    let baselineMotorWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.compareService.baselinePSAT, this.settings);
    for (var key in baselineMotorWarnings) {
      if (baselineMotorWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedPSAT && !hasWarning) {
      let modifiedMotorWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.compareService.modifiedPSAT, this.settings);
      for (var key in modifiedMotorWarnings) {
        if (modifiedMotorWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  tabChange(str: string) {
    this.psatService.modifyConditionsTab.next(str);
  }

  showTooltip(badge: string) {
    if (badge === 'pumpFluid') {
      this.pumpFluidBadgeHover = true;
    }
    else if (badge === 'motor') {
      this.motorBadgeHover = true;
    }
    else if (badge === 'fieldData') {
      this.fieldDataBadgeHover = true;
    }

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip(badge: string) {
    if (badge === 'pumpFluid') {
      this.pumpFluidBadgeHover = false;
      this.displayPumpFluidTooltip = false;
    }
    else if (badge === 'motor') {
      this.motorBadgeHover = false;
      this.displayMotorTooltip = false;
    }
    else if (badge === 'fieldData') {
      this.fieldDataBadgeHover = false;
      this.displayFieldDataTooltip = false;
    }
  }

  checkHover() {
    if (this.pumpFluidBadgeHover) {
      this.displayPumpFluidTooltip = true;
    }
    else {
      this.displayPumpFluidTooltip = false;
    }
    if (this.motorBadgeHover) {
      this.displayMotorTooltip = true;
    }
    else {
      this.displayMotorTooltip = false;
    }
    if (this.fieldDataBadgeHover) {
      this.displayFieldDataTooltip = true;
    }
    else {
      this.displayFieldDataTooltip = false;
    }
  }
}
