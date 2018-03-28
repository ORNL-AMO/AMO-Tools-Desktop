import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { OtherLossesService } from '../../other-losses/other-losses.service';
import { OtherLossesCompareService } from '../../other-losses/other-losses-compare.service';
import { OtherLoss } from '../../../../shared/models/phast/losses/otherLoss';

@Component({
  selector: 'app-other-tab',
  templateUrl: './other-tab.component.html',
  styleUrls: ['./other-tab.component.css']
})
export class OtherTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private otherLossesService: OtherLossesService, private otherLossesCompareService: OtherLossesCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.otherLossesCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.otherLosses) {
        this.numLosses = this.phast.losses.otherLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.otherLossesCompareService.baselineOtherLoss) {
      this.otherLossesCompareService.baselineOtherLoss.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.otherLossesCompareService.modifiedOtherLoss) {
      this.otherLossesCompareService.modifiedOtherLoss.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: OtherLoss) {
      let tmpForm: FormGroup = this.otherLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.otherLossesCompareService.baselineOtherLoss && this.otherLossesCompareService.modifiedOtherLoss) {
      return this.otherLossesCompareService.compareAllLosses();
    }
  }
}
