import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { FormGroup } from '@angular/forms';
import { FlueGasLossesService } from '../../flue-gas-losses/flue-gas-losses.service';
import { FlueGasCompareService } from '../../flue-gas-losses/flue-gas-compare.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';

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
  constructor(private lossesService: LossesService, private flueGasLossesService: FlueGasLossesService, private flueGasCompareService: FlueGasCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.flueGasDone = this.lossesService.flueGasDone;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();

    })

    this.flueGasCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
  }

  setBadgeClass(){
    if(this.missingData){
      this.badgeClass = ['missing-data'];
    }else if(this.inputError){
      this.badgeClass = ['input-error'];
    }else if(this.isDifferent){
      this.badgeClass = ['loss-different'];
    }else{
      this.badgeClass = ['success'];
    }
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
