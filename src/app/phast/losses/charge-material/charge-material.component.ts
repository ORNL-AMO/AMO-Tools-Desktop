import { Component, OnInit, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast';
import { ChargeMaterial } from '../../../shared/models/losses/chargeMaterial';
import { ChargeMaterialService } from './charge-material.service';
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

  _chargeMaterial: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private chargeMaterialService: ChargeMaterialService) { }

  ngOnChanges(changes: SimpleChange) {
    if (!changes.isFirstChange && this._chargeMaterial) {
      this.saveLosses();
    }
  }

  ngOnInit() {
    if (!this._chargeMaterial) {
      this._chargeMaterial = new Array();
    }
    if (this.losses.chargeMaterials) {
      this.initChargeMaterial();
    }
    this.lossState.numLosses = this._chargeMaterial.length;
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
          heatRequired: 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.unshift(tmpLoss);
      }
      else if (loss.chargeMaterialType == 'Solid') {
        let tmpLoss = {
          chargeMaterialType: 'Solid',
          solidForm: this.chargeMaterialService.getSolidChargeMaterialForm(loss.solidChargeMaterial),
          liquidForm: this.chargeMaterialService.initLiquidForm(),
          gasForm: this.chargeMaterialService.initGasForm(),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.unshift(tmpLoss);
      }
      else if (loss.chargeMaterialType == 'Liquid') {
        let tmpLoss = {
          chargeMaterialType: 'Liquid',
          solidForm: this.chargeMaterialService.initSolidForm(),
          liquidForm: this.chargeMaterialService.getLiquidChargeMaterialForm(loss.liquidChargeMaterial),
          gasForm: this.chargeMaterialService.initGasForm(),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.unshift(tmpLoss);
      }
    })
  }

  addMaterial() {
    this._chargeMaterial.unshift({
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
        tmpChargeMaterials.unshift({
          chargeMaterialType: 'Gas',
          gasChargeMaterial: tmpGasMaterial
        })
      } else if (material.chargeMaterialType == 'Solid') {
        let tmpSolidMaterial = this.chargeMaterialService.buildSolidChargeMaterial(material.solidForm);
        tmpChargeMaterials.unshift({
          chargeMaterialType: 'Solid',
          solidChargeMaterial: tmpSolidMaterial
        })
      } else if (material.chargeMaterialType == 'Liquid') {
        let tmpLiquidMaterial = this.chargeMaterialService.buildLiquidChargeMaterial(material.liquidForm);
        tmpChargeMaterials.unshift({
          chargeMaterialType: 'Liquid',
          liquidChargeMaterial: tmpLiquidMaterial
        })
      }
    })
    this.losses.chargeMaterials = tmpChargeMaterials;
    this.lossState.numLosses = this.losses.chargeMaterials.length;
    this.lossState.saved = true;
  }
}
