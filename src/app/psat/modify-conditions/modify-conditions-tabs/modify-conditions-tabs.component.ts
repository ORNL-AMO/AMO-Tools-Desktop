import { Component, OnInit, Input } from '@angular/core';
import { CompareService } from '../../compare.service';
import { PsatService } from '../../psat.service';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PsatWarningService, FieldDataWarnings, MotorWarnings, OperationsWarnings } from '../../psat-warning.service';
import { Settings } from '../../../shared/models/settings';
import { PsatTabService } from '../../psat-tab.service';
import { PumpFluidService } from '../../pump-fluid/pump-fluid.service';
import { MotorService } from '../../motor/motor.service';
import { FieldDataService } from '../../field-data/field-data.service';
import { PumpOperationsService } from '../../pump-operations/pump-operations.service';

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
  displayOperationsTooltip: boolean;
  operationsBadgeHover: boolean;

  operationsBadgeClass: string;
  pumpFluidBadgeClass: string;
  motorBadgeClass: string;
  fieldDataBadgeClass: string;
  resultsSub: Subscription;
  modTabSub: Subscription;
  modifyTab: string;
  constructor(private compareService: CompareService, private psatService: PsatService, private psatWarningService: PsatWarningService, private psatTabService: PsatTabService,
    private pumpFluidService: PumpFluidService, private motorService: MotorService, private fieldDataService: FieldDataService, private pumpOperationsService: PumpOperationsService) { }

  ngOnInit() {
    this.resultsSub = this.psatService.getResults.subscribe(val => {
      this.setBadgeClass();
    })

    this.modTabSub = this.psatTabService.modifyConditionsTab.subscribe(val => {
      this.modifyTab = val;
    })

    this.displayPumpFluidTooltip = false;
    this.pumpFluidBadgeHover = false;
    this.displayMotorTooltip = false;
    this.motorBadgeHover = false;
    this.displayFieldDataTooltip = false;
    this.fieldDataBadgeHover = false;
    this.displayOperationsTooltip = false;
    this.operationsBadgeHover = false;
  }

  ngOnDestroy() {
    this.resultsSub.unsubscribe();
    this.modTabSub.unsubscribe();
  }

  setBadgeClass() {
    this.fieldDataBadgeClass = this.setFieldDataBadgeClass();
    this.pumpFluidBadgeClass = this.setPumpFluidBadgeClass();
    this.motorBadgeClass = this.setMotorBadgeClass();
    this.operationsBadgeClass = this.setoperationsBadgeClass();
  }

  setFieldDataBadgeClass() {
    let badgeStr: string = 'success';
    let tmpBaselineFieldDataForm: UntypedFormGroup = this.fieldDataService.getFormFromObj(this.compareService.baselinePSAT.inputs, true);
    let validBaselineTest = tmpBaselineFieldDataForm.valid;
    let validModTest = true;
    let isDifferent = false;
    if (this.compareService.modifiedPSAT) {
      let tmpModificationFieldDataForm: UntypedFormGroup = this.fieldDataService.getFormFromObj(this.compareService.modifiedPSAT.inputs, false);
      validModTest = tmpModificationFieldDataForm.valid;
      isDifferent = this.compareService.checkFieldDataDifferent();
    }
    let inputError = this.checkFieldDataInputError();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
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

  setPumpFluidBadgeClass() {
    let badgeStr: string = 'success';
    let tmpBaselinePumpFluidForm: UntypedFormGroup = this.pumpFluidService.getFormFromObj(this.compareService.baselinePSAT.inputs);
    let validBaselineTest = tmpBaselinePumpFluidForm.valid;
    let validModTest = true;
    let isDifferent = false;
    if (this.compareService.modifiedPSAT) {
      let tmpModificationPumpFluidForm: UntypedFormGroup = this.pumpFluidService.getFormFromObj(this.compareService.modifiedPSAT.inputs);
      validModTest = tmpModificationPumpFluidForm.valid;
      isDifferent = this.compareService.checkPumpDifferent(this.settings);
    }
    let inputError = this.checkPumpFluidWarnings();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  checkPumpFluidWarnings() {
    let hasWarning: boolean = false;
    let baselinePumpFluidWarnings: { rpmError: string, temperatureError: string } = this.psatWarningService.checkPumpFluidWarnings(this.compareService.baselinePSAT, this.settings);
    for (var key in baselinePumpFluidWarnings) {
      if (baselinePumpFluidWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedPSAT && !hasWarning) {
      let modifiedPumpFluidWarnings: { rpmError: string, temperatureError: string } = this.psatWarningService.checkPumpFluidWarnings(this.compareService.modifiedPSAT, this.settings);
      for (var key in modifiedPumpFluidWarnings) {
        if (modifiedPumpFluidWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  setMotorBadgeClass() {
    let badgeStr: string = 'success';
    let tmpBaselineMotorForm: UntypedFormGroup = this.motorService.getFormFromObj(this.compareService.baselinePSAT.inputs);
    let validBaselineTest = tmpBaselineMotorForm.valid;
    let inputError = this.checkMotorInputError();
    let validModTest = true;
    let isDifferent = false;
    if (this.compareService.modifiedPSAT) {
      let tmpModificationMotorForm: UntypedFormGroup = this.motorService.getFormFromObj(this.compareService.modifiedPSAT.inputs);
      validModTest = tmpModificationMotorForm.valid;
      isDifferent = this.compareService.checkMotorDifferent();
    }
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  checkMotorInputError() {
    let hasWarning: boolean = false;
    let baselineMotorWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.compareService.baselinePSAT, this.settings, false);
    for (var key in baselineMotorWarnings) {
      if (baselineMotorWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedPSAT && !hasWarning) {
      let modifiedMotorWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.compareService.modifiedPSAT, this.settings, true);
      for (var key in modifiedMotorWarnings) {
        if (modifiedMotorWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  setoperationsBadgeClass() {
    let badgeStr: string = 'success';
    let tmpBaselineOperationsForm: UntypedFormGroup = this.pumpOperationsService.getFormFromObj(this.compareService.baselinePSAT.inputs, true);
    let validBaselineTest = tmpBaselineOperationsForm.valid;
    let validModTest = true;
    let isDifferent = false;
    if (this.compareService.modifiedPSAT) {
      let tmpModificationOperationsForm: UntypedFormGroup = this.pumpOperationsService.getFormFromObj(this.compareService.modifiedPSAT.inputs, false);
      validModTest = tmpModificationOperationsForm.valid;
      isDifferent = this.compareService.checkOperationsDifferent();
    }
    let inputError = this.checkOperationsInputError();
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (inputError) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;

  }

  checkOperationsInputError(){
    let hasWarning: boolean = false;
    let baselineOperationsWarnings: OperationsWarnings = this.psatWarningService.checkPumpOperations(this.compareService.baselinePSAT, this.settings, true);
    for (var key in baselineOperationsWarnings) {
      if (baselineOperationsWarnings[key] !== null) {
        hasWarning = true;
      }
    }
    if (this.compareService.modifiedPSAT && !hasWarning) {
      let modifiedOperationsWarnings: OperationsWarnings = this.psatWarningService.checkPumpOperations(this.compareService.modifiedPSAT, this.settings);
      for (var key in modifiedOperationsWarnings) {
        if (modifiedOperationsWarnings[key] !== null) {
          hasWarning = true;
        }
      }
    }
    return hasWarning;
  }

  tabChange(str: string) {
    this.psatTabService.modifyConditionsTab.next(str);
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
    else if (badge === 'operations') {
      this.operationsBadgeHover = true;
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
    else if (badge === 'operations') {
      this.operationsBadgeHover = false;
      this.displayOperationsTooltip = false;
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
    if (this.operationsBadgeHover) {
      this.displayOperationsTooltip = true;
    }
    else {
      this.displayOperationsTooltip = false;
    }
  }
}
