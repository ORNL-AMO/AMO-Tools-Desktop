import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { OpeningLossesService } from '../../opening-losses/opening-losses.service';
import { OpeningLossesCompareService } from '../../opening-losses/opening-losses-compare.service';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';


@Component({
  selector: 'app-opening-tab',
  templateUrl: './opening-tab.component.html',
  styleUrls: ['./opening-tab.component.css']
})
export class OpeningTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private openingLossesService: OpeningLossesService, private openingLossesCompareService: OpeningLossesCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.openingLossesCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.openingLosses) {
        this.numLosses = this.phast.losses.openingLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.openingLossesCompareService.baselineOpeningLosses) {
      this.openingLossesCompareService.baselineOpeningLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.openingLossesCompareService.modifiedOpeningLosses) {
      this.openingLossesCompareService.modifiedOpeningLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: OpeningLoss) {
      let tmpForm: FormGroup = this.openingLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.openingLossesCompareService.baselineOpeningLosses && this.openingLossesCompareService.modifiedOpeningLosses) {
      return this.openingLossesCompareService.compareAllLosses();
    }
  }
}
