import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompareService } from '../../compare.service';
import { PsatService } from '../../psat.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {
  @Input()
  modifyTab: string;
  @Output('changeTab')
  changeTab = new EventEmitter<string>();

  pumpFluidBadgeClass: Array<string>;
  motorBadgeClass: Array<string>;
  fieldDataBadgeClass: Array<string>;
  resultsSub: Subscription;
  constructor(private compareService: CompareService, private psatService: PsatService) { }

  ngOnInit() {
    this.resultsSub = this.psatService.getResults.subscribe(val => {
      this.setBadgeClass();
    })
  }

  ngOnDestroy(){
    this.resultsSub.unsubscribe();
  }

  setBadgeClass() {
    let tmpBaslineForm = this.psatService.getFormFromPsat(this.compareService.baselinePSAT.inputs);
    let tmpModForm = this.psatService.getFormFromPsat(this.compareService.modifiedPSAT.inputs);
    this.fieldDataBadgeClass = this.setFieldDataBadgeClass(tmpBaslineForm, tmpModForm);
    this.pumpFluidBadgeClass = this.setPumpFluidBadgeClass(tmpBaslineForm, tmpModForm);
    this.motorBadgeClass = this.setMotorBadgeClass(tmpBaslineForm, tmpModForm);
  }

  setFieldDataBadgeClass(baselineForm: FormGroup, modifiedForm: FormGroup) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.psatService.isFieldDataFormValid(baselineForm);
    let validModTest = this.psatService.isFieldDataFormValid(modifiedForm)
    let isDifferent = this.compareService.checkFieldDataDifferent();
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

  setPumpFluidBadgeClass(baselineForm: FormGroup, modifiedForm: FormGroup) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.psatService.isPumpFluidFormValid(baselineForm);
    let validModTest = this.psatService.isPumpFluidFormValid(modifiedForm)
    let isDifferent = this.compareService.checkPumpDifferent();
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

  setMotorBadgeClass(baselineForm: FormGroup, modifiedForm: FormGroup) {
    let badgeStr: Array<string> = ['success'];
    let validBaselineTest = this.psatService.isMotorFormValid(baselineForm);
    let validModTest = this.psatService.isMotorFormValid(modifiedForm)
    let isDifferent = this.compareService.checkMotorDifferent();
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

  tabChange(str: string) {
    this.changeTab.emit(str);
  }
}
