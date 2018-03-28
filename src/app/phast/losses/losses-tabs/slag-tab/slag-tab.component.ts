import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { SlagService } from '../../slag/slag.service';
import { SlagCompareService } from '../../slag/slag-compare.service';
import { Slag } from '../../../../shared/models/phast/losses/slag';

@Component({
  selector: 'app-slag-tab',
  templateUrl: './slag-tab.component.html',
  styleUrls: ['./slag-tab.component.css']
})
export class SlagTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private slagService: SlagService, private slagCompareService: SlagCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.slagCompareService.inputError.subscribe(val => {
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

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.slagLosses) {
        this.numLosses = this.phast.losses.slagLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.slagCompareService.baselineSlag) {
      this.slagCompareService.baselineSlag.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.slagCompareService.modifiedSlag) {
      this.slagCompareService.modifiedSlag.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: Slag) {
      let tmpForm: FormGroup = this.slagService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.slagCompareService.baselineSlag && this.slagCompareService.modifiedSlag) {
      return this.slagCompareService.compareAllLosses();
    }
  }

}
