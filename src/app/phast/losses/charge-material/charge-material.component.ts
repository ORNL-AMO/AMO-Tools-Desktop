import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast';
import { ChargeMaterial } from '../../../shared/models/losses/chargeMaterial';
import { ChargeMaterialService } from './charge-material.service';
import { ChargeMaterialCompareService } from './charge-material-compare.service';

@Component({
  selector: 'app-charge-material',
  templateUrl: './charge-material.component.html',
  styleUrls: ['./charge-material.component.css']
})
export class ChargeMaterialComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  lossState: any;
  @Input()
  addLossToggle: boolean;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;

  _chargeMaterial: Array<any>;
  firstChange: boolean = true;
  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private chargeMaterialService: ChargeMaterialService, private chargeMaterialCompareService: ChargeMaterialCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
      if (changes.addLossToggle) {
        this.addMaterial();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    if (!this._chargeMaterial) {
      this._chargeMaterial = new Array();
    }
    if (this.losses.chargeMaterials) {
      this.setCompareVals();
      this.chargeMaterialCompareService.initCompareObjects();
      this.initChargeMaterial();
    }
    this.lossState.numLosses = this._chargeMaterial.length;
  }

  ngOnDestroy(){
    this.chargeMaterialCompareService.baselineMaterials = null;
    this.chargeMaterialCompareService.modifiedMaterials = null;
  }

  initChargeMaterial() {
    this.losses.chargeMaterials.forEach(loss => {
      if (loss.chargeMaterialType == 'Gas') {
        let tmpLoss = {
          chargeMaterialType: 'Gas',
          solidForm: this.chargeMaterialService.initSolidForm(),
          liquidForm: this.chargeMaterialService.initLiquidForm(),
          gasForm: this.chargeMaterialService.getGasChargeMaterialForm(loss.gasChargeMaterial),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: loss.gasChargeMaterial.heatRequired || 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.push(tmpLoss);
      }
      else if (loss.chargeMaterialType == 'Solid') {
        let tmpLoss = {
          chargeMaterialType: 'Solid',
          solidForm: this.chargeMaterialService.getSolidChargeMaterialForm(loss.solidChargeMaterial),
          liquidForm: this.chargeMaterialService.initLiquidForm(),
          gasForm: this.chargeMaterialService.initGasForm(),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: loss.solidChargeMaterial.heatRequired || 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.push(tmpLoss);
      }
      else if (loss.chargeMaterialType == 'Liquid') {
        let tmpLoss = {
          chargeMaterialType: 'Liquid',
          solidForm: this.chargeMaterialService.initSolidForm(),
          liquidForm: this.chargeMaterialService.getLiquidChargeMaterialForm(loss.liquidChargeMaterial),
          gasForm: this.chargeMaterialService.initGasForm(),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: loss.liquidChargeMaterial.heatRequired || 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.push(tmpLoss);
      }
    })
  }

  addMaterial() {
    this._chargeMaterial.push({
      chargeMaterialType: 'Solid',
      solidForm: this.chargeMaterialService.initSolidForm(),
      liquidForm: this.chargeMaterialService.initLiquidForm(),
      gasForm: this.chargeMaterialService.initGasForm(),
      name: 'Material #' + (this._chargeMaterial.length + 1),
      heatRequired: 0.0,
      modifiedHeatRequired: 0.0
    });
    this.lossState.saved = false;
  }

  removeMaterial(str: string) {
    this._chargeMaterial = _.remove(this._chargeMaterial, material => {
      return material.name != str;
    });
    this.renameMaterial();
    this.lossState.saved = false;
  }

  renameMaterial() {
    let index = 1;
    this._chargeMaterial.forEach(material => {
      material.name = 'Material #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    if (loss.chargeMaterialType == 'Solid') {
      let reactionType = 0;
      if (loss.solidForm.value.endothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.heatRequired = this.phastService.solidLoadChargeMaterial(
        reactionType,
        loss.solidForm.value.materialSpecificHeatOfSolidMaterial,
        loss.solidForm.value.materialLatentHeatOfFusion,
        loss.solidForm.value.materialHeatOfLiquid,
        loss.solidForm.value.materialMeltingPoint,
        loss.solidForm.value.feedRate,
        loss.solidForm.value.waterContentAsCharged,
        loss.solidForm.value.waterContentAsDischarged,
        loss.solidForm.value.initialTemperature,
        loss.solidForm.value.chargeMaterialDischargeTemperature,
        loss.solidForm.value.waterVaporDischargeTemperature,
        loss.solidForm.value.percentChargeMelted,
        loss.solidForm.value.percentChargeReacted,
        loss.solidForm.value.heatOfReaction,
        loss.solidForm.value.additionalHeatRequired,
      );
    } else if (loss.chargeMaterialType == 'Liquid') {
      let reactionType = 0;
      if (loss.liquidForm.value.endothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.heatRequired = this.phastService.liquidLoadChargeMaterial(
        reactionType,
        loss.liquidForm.value.materialSpecificHeatLiquid,
        loss.liquidForm.value.materialVaporizingTemperature,
        loss.liquidForm.value.materialLatentHeat,
        loss.liquidForm.value.materialSpecificHeatVapor,
        loss.liquidForm.value.feedRate,
        loss.liquidForm.value.initialTemperature,
        loss.liquidForm.value.dischargeTemperature,
        loss.liquidForm.value.liquidVaporized,
        loss.liquidForm.value.liquidReacted,
        loss.liquidForm.value.heatOfReaction,
        loss.liquidForm.value.additionalHeatRequired
      )
    } else if (loss.chargeMaterialType == 'Gas') {
      let reactionType = 0;
      if (loss.gasForm.value.endothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.heatRequired = this.phastService.gasLoadChargeMaterial(
        reactionType,
        loss.gasForm.value.materialSpecificHeat,
        loss.gasForm.value.feedRate,
        loss.gasForm.value.vaporInGas,
        loss.gasForm.value.initialTemperature,
        loss.gasForm.value.dischargeTemperature,
        loss.gasForm.value.specificHeatOfVapor,
        loss.gasForm.value.gasReacted,
        loss.gasForm.value.heatOfReaction,
        loss.gasForm.value.additionalHeatRequired,
      )
    }
  }

  saveLosses() {
    let tmpChargeMaterials = new Array<ChargeMaterial>();
    this._chargeMaterial.forEach(material => {
      if (material.chargeMaterialType == 'Gas') {
        let tmpGasMaterial = this.chargeMaterialService.buildGasChargeMaterial(material.gasForm);
        tmpGasMaterial.heatRequired = material.heatRequired;
        tmpChargeMaterials.push({
          chargeMaterialType: 'Gas',
          gasChargeMaterial: tmpGasMaterial
        })
      } else if (material.chargeMaterialType == 'Solid') {
        let tmpSolidMaterial = this.chargeMaterialService.buildSolidChargeMaterial(material.solidForm);
        tmpSolidMaterial.heatRequired = material.heatRequired;
        tmpChargeMaterials.push({
          chargeMaterialType: 'Solid',
          solidChargeMaterial: tmpSolidMaterial
        })
      } else if (material.chargeMaterialType == 'Liquid') {
        let tmpLiquidMaterial = this.chargeMaterialService.buildLiquidChargeMaterial(material.liquidForm);
        tmpLiquidMaterial.heatRequired = material.heatRequired;
        tmpChargeMaterials.push({
          chargeMaterialType: 'Liquid',
          liquidChargeMaterial: tmpLiquidMaterial
        })
      }
    })
    this.losses.chargeMaterials = tmpChargeMaterials;
    this.lossState.numLosses = this.losses.chargeMaterials.length;
    this.lossState.saved = true;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.chargeMaterialCompareService.baselineMaterials = this.losses.chargeMaterials;
    } else {
      this.chargeMaterialCompareService.modifiedMaterials = this.losses.chargeMaterials;
    }
    if (this.chargeMaterialCompareService.differentArray) {
      if (this.chargeMaterialCompareService.differentArray.length != 0) {
        this.chargeMaterialCompareService.checkChargeMaterials();
      }
    }
  }
}
