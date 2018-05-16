import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { WallLossesService } from '../../wall-losses/wall-losses.service';
import { WallLossCompareService } from '../../wall-losses/wall-loss-compare.service';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wall-tab',
  templateUrl: './wall-tab.component.html',
  styleUrls: ['./wall-tab.component.css']
})
export class WallTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;
  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private wallLossesService: WallLossesService, private wallLossCompareService: WallLossCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.wallLossCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })

    this.badgeHover = false;
  }

  ngOnDestroy() {
    this.compareSubscription.unsubscribe();
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData) {
      badgeStr = ['missing-data'];
    } else if (this.inputError) {
      badgeStr = ['input-error'];
    } else if (this.isDifferent && !this.inSetup) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
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
    if (this.wallLossCompareService.modifiedWallLosses && !this.inSetup) {
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

  showTooltip() {
    this.badgeHover = true;

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip() {
    this.badgeHover = false;
    this.displayTooltip = false;
  }

  checkHover() {
    if (this.badgeHover) {
      this.displayTooltip = true;
    }
    else {
      this.displayTooltip = false;
    }
  }
}
