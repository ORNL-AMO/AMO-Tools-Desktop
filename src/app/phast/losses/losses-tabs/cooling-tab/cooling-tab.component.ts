import { Component, OnInit, Input, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { CoolingLossesCompareService } from '../../cooling-losses/cooling-losses-compare.service';
import { CoolingLossesService } from '../../cooling-losses/cooling-losses.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-cooling-tab',
  templateUrl: './cooling-tab.component.html',
  styleUrls: ['./cooling-tab.component.css']
})
export class CoolingTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private coolingLossesCompareService: CoolingLossesCompareService, private coolingLossesService: CoolingLossesService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    });

    this.compareSubscription = this.coolingLossesCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    });

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
      if (this.phast.losses.coolingLosses) {
        this.numLosses = this.phast.losses.coolingLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.coolingLossesCompareService.baselineCoolingLosses) {
      this.coolingLossesCompareService.baselineCoolingLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.coolingLossesCompareService.modifiedCoolingLosses && !this.inSetup) {
      this.coolingLossesCompareService.modifiedCoolingLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: CoolingLoss) {
    if (loss.coolingLossType == 'Gas') {
      let tmpForm: FormGroup = this.coolingLossesService.initGasFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    }else  if (loss.coolingLossType == 'Liquid') {
      let tmpForm: FormGroup = this.coolingLossesService.initLiquidFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    }
  }

  checkDifferent() {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses) {
      return this.coolingLossesCompareService.compareAllLosses();
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
