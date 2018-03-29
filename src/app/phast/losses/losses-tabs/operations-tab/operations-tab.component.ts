import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';

import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { OperationsService } from '../../operations/operations.service';
import { OperationsCompareService } from '../../operations/operations-compare.service';


@Component({
  selector: 'app-operations-tab',
  templateUrl: './operations-tab.component.html',
  styleUrls: ['./operations-tab.component.css']
})
export class OperationsTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private operationsService: OperationsService, private operationsCompareService: OperationsCompareService) { }

  ngOnInit() {
    this.lossesService.updateTabs.subscribe(val => {
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.operationsCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
  }

  setBadgeClass() {
    if (this.missingData) {
      this.badgeClass = ['missing-data'];
    } else if (this.inputError) {
      this.badgeClass = ['input-error'];
    } else if (this.isDifferent) {
      this.badgeClass = ['loss-different'];
    } else {
      this.badgeClass = ['success'];
    }
  }

  checkMissingData(): boolean {
    let testVal = false;
    if (this.operationsCompareService.baseline) {
      if (this.checkLossValid(this.operationsCompareService.baseline) == false) {
        testVal = true;
      }
    }
    if (this.operationsCompareService.modification) {
      if (this.checkLossValid(this.operationsCompareService.modification) == false) {
        testVal = true;
      }
    }
    return testVal;
  }


  checkLossValid(phast: PHAST) {
    let tmpForm: FormGroup = this.operationsService.initForm(phast);
    if (tmpForm.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.operationsCompareService.baseline && this.operationsCompareService.modification) {
      return this.operationsCompareService.compareAllLosses();
    }
  }
}
