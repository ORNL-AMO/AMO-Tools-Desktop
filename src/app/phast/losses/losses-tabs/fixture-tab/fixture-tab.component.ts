import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { FixtureLossesCompareService } from '../../fixture-losses/fixture-losses-compare.service';
import { FixtureLossesService } from '../../fixture-losses/fixture-losses.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fixture-tab',
  templateUrl: './fixture-tab.component.html',
  styleUrls: ['./fixture-tab.component.css']
})
export class FixtureTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private fixtureLossesService: FixtureLossesService, private fixtureLossesCompareService: FixtureLossesCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.fixtureLossesCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })

    this.badgeHover = false;
  }

  ngOnDestroy(){
    this.compareSubscription.unsubscribe();
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass(){
    let badgeStr: Array<string> = ['success'];
    if(this.missingData){
      badgeStr = ['missing-data'];
    }else if(this.inputError){
      badgeStr = ['input-error'];
    }else if(this.isDifferent && !this.inSetup){
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
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
    if (this.fixtureLossesCompareService.modifiedFixtureLosses && !this.inSetup) {
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
