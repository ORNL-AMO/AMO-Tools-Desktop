import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
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
  compareSubscription: any;
  lossSubscription: any;
  constructor(private lossesService: LossesService, private chargeMaterialCompareService: ChargeMaterialCompareService, private chargeMaterialService: ChargeMaterialService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.chargeDone = this.lossesService.chargeDone;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();

    })

    this.compareSubscription = this.chargeMaterialCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
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
    }else if(this.isDifferent){
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
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
