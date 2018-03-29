import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { FormGroup } from '@angular/forms';
import { FlueGasLossesService } from '../../flue-gas-losses/flue-gas-losses.service';
import { FlueGasCompareService } from '../../flue-gas-losses/flue-gas-compare.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flue-gas-tab',
  templateUrl: './flue-gas-tab.component.html',
  styleUrls: ['./flue-gas-tab.component.css']
})
export class FlueGasTabComponent implements OnInit {
  @Input()
  phast: PHAST;


  numLosses: number = 0;
  flueGasDone: boolean;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private flueGasLossesService: FlueGasLossesService, private flueGasCompareService: FlueGasCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.flueGasDone = this.lossesService.flueGasDone;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();

    })

    this.compareSubscription = this.flueGasCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
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
    } else if (this.isDifferent) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.flueGasLosses) {
        this.numLosses = this.phast.losses.flueGasLosses.length;
      }
    }
  }

  checkMissingData(): boolean {
    let testVal = false;
    if (this.flueGasCompareService.baselineFlueGasLoss) {
      this.flueGasCompareService.baselineFlueGasLoss.forEach(material => {
        if (this.checkMaterialValid(material) == false) {
          testVal = true;
        }
      })
    }
    if (this.flueGasCompareService.modifiedFlueGasLoss) {
      this.flueGasCompareService.modifiedFlueGasLoss.forEach(material => {
        if (this.checkMaterialValid(material) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkMaterialValid(loss: FlueGas) {
    if (loss.flueGasType == 'By Volume') {
      let tmpForm: FormGroup = this.flueGasLossesService.initByVolumeFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    } else if (loss.flueGasType == 'By Mass') {
      let tmpForm: FormGroup = this.flueGasLossesService.initByMassFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    }
  }

  checkDifferent() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss) {
      return this.flueGasCompareService.compareAllLosses();
    }
  }
}
