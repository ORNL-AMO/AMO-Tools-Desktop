import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { AtmosphereLossesCompareService } from '../../atmosphere-losses/atmosphere-losses-compare.service';
import { AtmosphereLossesService } from '../../atmosphere-losses/atmosphere-losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';

@Component({
  selector: 'app-atmosphere-tab',
  templateUrl: './atmosphere-tab.component.html',
  styleUrls: ['./atmosphere-tab.component.css']
})
export class AtmosphereTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private atmosphereLossesCompareService: AtmosphereLossesCompareService, private atmosphereLossesService: AtmosphereLossesService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
      console.log('check')
    })

    this.atmosphereLossesCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses) {
      this.atmosphereLossesCompareService.baselineAtmosphereLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.atmosphereLossesCompareService.modifiedAtmosphereLosses) {
      this.atmosphereLossesCompareService.modifiedAtmosphereLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: AtmosphereLoss) {
      let tmpForm: FormGroup = this.atmosphereLossesService.getAtmosphereForm(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses && this.atmosphereLossesCompareService.modifiedAtmosphereLosses) {
      return this.atmosphereLossesCompareService.compareAllLosses();
    }
  }
}
