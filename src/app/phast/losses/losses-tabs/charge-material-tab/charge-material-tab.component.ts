import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { ChargeMaterialCompareService } from '../../charge-material/charge-material-compare.service';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { ChargeMaterialService, SolidMaterialWarnings, LiquidMaterialWarnings, GasMaterialWarnings } from '../../charge-material/charge-material.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-charge-material-tab',
  templateUrl: './charge-material-tab.component.html',
  styleUrls: ['./charge-material-tab.component.css']
})
export class ChargeMaterialTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  chargeDone: boolean;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private chargeMaterialCompareService: ChargeMaterialCompareService, private chargeMaterialService: ChargeMaterialService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.chargeDone = this.lossesService.chargeDone;
      let dataCheck: { missingData: boolean, hasWarning: boolean } = this.checkLossData();
      this.missingData = dataCheck.missingData;
      this.isDifferent = this.checkDifferent();
      this.inputError = dataCheck.hasWarning;
      this.setBadgeClass();
    })
    this.badgeHover = false;
  }

  ngOnDestroy() {
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData || !this.chargeDone) {
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
      if (this.phast.losses.chargeMaterials) {
        this.numLosses = this.phast.losses.chargeMaterials.length;
      }
    }
  }

  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.chargeMaterialCompareService.baselineMaterials) {
      this.chargeMaterialCompareService.baselineMaterials.forEach(material => {
        if (this.checkMaterialValid(material) == false) {
          missingData = true;
        }
        let tmpHasWarning: boolean = this.checkWarningExists(material);
        if (tmpHasWarning == true) {
          hasWarning = tmpHasWarning;
        }
      })
    }
    if (this.chargeMaterialCompareService.modifiedMaterials && !this.inSetup) {
      this.chargeMaterialCompareService.modifiedMaterials.forEach(material => {
        if (this.checkMaterialValid(material) == false) {
          missingData = true;
        }
        let tmpHasWarning: boolean = this.checkWarningExists(material);
        if (tmpHasWarning == true) {
          hasWarning = tmpHasWarning;
        }
      })
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }

  checkWarningExists(material: ChargeMaterial): boolean {
    if (material.chargeMaterialType == 'Gas') {
      let warnings: GasMaterialWarnings = this.chargeMaterialService.checkGasWarnings(material.gasChargeMaterial);
      let tmpHasWarning: boolean = this.chargeMaterialService.checkWarningsExist(warnings);
      return tmpHasWarning;
    } else if (material.chargeMaterialType == 'Liquid') {
      let warnings: LiquidMaterialWarnings = this.chargeMaterialService.checkLiquidWarnings(material.liquidChargeMaterial);
      let tmpHasWarning: boolean = this.chargeMaterialService.checkWarningsExist(warnings);
      return tmpHasWarning;
    } else if (material.chargeMaterialType == 'Solid') {
      let warnings: SolidMaterialWarnings = this.chargeMaterialService.checkSolidWarnings(material.solidChargeMaterial);
      let tmpHasWarning: boolean = this.chargeMaterialService.checkWarningsExist(warnings);
      return tmpHasWarning;
    }
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
