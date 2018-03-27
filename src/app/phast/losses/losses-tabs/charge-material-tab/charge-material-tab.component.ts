import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { ChargeMaterialCompareService } from '../../charge-material/charge-material-compare.service';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { ChargeMaterialService } from '../../charge-material/charge-material.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-charge-material-tab',
  templateUrl: './charge-material-tab.component.html',
  styleUrls: ['./charge-material-tab.component.css']
})
export class ChargeMaterialTabComponent implements OnInit {
  @Input()
  phast: PHAST;


  numLosses: number = 0;
  chargeDone: boolean;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private chargeMaterialCompareService: ChargeMaterialCompareService, private chargeMaterialService: ChargeMaterialService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.chargeDone = this.lossesService.chargeDone;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();

    })

    this.chargeMaterialCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.chargeMaterials) {
        this.numLosses = this.phast.losses.chargeMaterials.length;
      }
    }
  }

  checkMissingData(): boolean {
    let testVal = false;
    if (this.chargeMaterialCompareService.baselineMaterials) {
      this.chargeMaterialCompareService.baselineMaterials.forEach(material => {
        if (this.checkMaterialValid(material) == false) {
          testVal = true;
        }
      })
    }
    if (this.chargeMaterialCompareService.modifiedMaterials) {
      this.chargeMaterialCompareService.modifiedMaterials.forEach(material => {
        if (this.checkMaterialValid(material) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkMaterialValid(material: ChargeMaterial) {
    if (material.chargeMaterialType == 'Gas') {
      let tmpForm: FormGroup = this.chargeMaterialService.getGasChargeMaterialForm(material);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    } else if (material.chargeMaterialType == 'Solid') {
      let tmpForm: FormGroup = this.chargeMaterialService.getSolidChargeMaterialForm(material);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    } else if (material.chargeMaterialType == 'Liquid') {
      let tmpForm: FormGroup = this.chargeMaterialService.getLiquidChargeMaterialForm(material);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    }
  }

  checkDifferent() {
    if (this.chargeMaterialCompareService.baselineMaterials && this.chargeMaterialCompareService.modifiedMaterials) {
      return this.chargeMaterialCompareService.compareAllMaterials();
    }
  }
}
