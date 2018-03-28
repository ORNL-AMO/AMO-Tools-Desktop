import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { FixtureLossesCompareService } from '../../fixture-losses/fixture-losses-compare.service';
import { FixtureLossesService } from '../../fixture-losses/fixture-losses.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';

@Component({
  selector: 'app-fixture-tab',
  templateUrl: './fixture-tab.component.html',
  styleUrls: ['./fixture-tab.component.css']
})
export class FixtureTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private fixtureLossesService: FixtureLossesService, private fixtureLossesCompareService: FixtureLossesCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.fixtureLossesCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.fixtureLosses) {
        this.numLosses = this.phast.losses.fixtureLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.fixtureLossesCompareService.baselineFixtureLosses) {
      this.fixtureLossesCompareService.baselineFixtureLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.fixtureLossesCompareService.modifiedFixtureLosses) {
      this.fixtureLossesCompareService.modifiedFixtureLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: FixtureLoss) {
      let tmpForm: FormGroup = this.fixtureLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.fixtureLossesCompareService.baselineFixtureLosses && this.fixtureLossesCompareService.modifiedFixtureLosses) {
      return this.fixtureLossesCompareService.compareAllLosses();
    }
  }
}
