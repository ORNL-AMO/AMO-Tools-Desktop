import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { WallLossesService } from '../../wall-losses/wall-losses.service';
import { WallLossCompareService } from '../../wall-losses/wall-loss-compare.service';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';

@Component({
  selector: 'app-wall-tab',
  templateUrl: './wall-tab.component.html',
  styleUrls: ['./wall-tab.component.css']
})
export class WallTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private wallLossesService: WallLossesService, private wallLossCompareService: WallLossCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.wallLossCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.wallLosses) {
        this.numLosses = this.phast.losses.wallLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.wallLossCompareService.baselineWallLosses) {
      this.wallLossCompareService.baselineWallLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.wallLossCompareService.modifiedWallLosses) {
      this.wallLossCompareService.modifiedWallLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: WallLoss) {
    let tmpForm: FormGroup = this.wallLossesService.getWallLossForm(loss);
    if (tmpForm.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses) {
      return this.wallLossCompareService.compareAllLosses();
    }
  }

}
