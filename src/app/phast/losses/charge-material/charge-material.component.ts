import { Component, OnInit, Input } from '@angular/core';
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

  chargeMaterial: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private chargeMaterialService: ChargeMaterialService) { }

  ngOnInit() {
    if (!this.chargeMaterial) {
      this.chargeMaterial = new Array();
    }
    if (this.losses.chargeMaterials) {
      this.losses.chargeMaterials.forEach(loss => {
        if (loss.inputs.chargeMaterialType == 'Gas') {
          let tmpLoss = {
            chargeMaterialType: 'Gas',
            solidForm: this.chargeMaterialService.initSolidForm(),
            liquidForm: this.chargeMaterialService.initLiquidForm(),
            gasForm: this.chargeMaterialService.getGasChargeMaterialForm(loss.inputs.gasChargeMaterial),
            name: 'Material #' + (this.chargeMaterial.length + 1),
            baselineHeatRequired: 0.0,
            modifiedHeatRequired: 0.0
          };
          this.calculateBaseline(tmpLoss);
          this.calculateModified(tmpLoss);
          this.chargeMaterial.unshift(tmpLoss);
        }
        else if (loss.inputs.chargeMaterialType == 'Solid') {
          let tmpLoss = {
            chargeMaterialType: 'Solid',
            solidForm: this.chargeMaterialService.getSolidChargeMaterialForm(loss.inputs.solidChargeMaterial),
            liquidForm: this.chargeMaterialService.initLiquidForm(),
            gasForm: this.chargeMaterialService.initGasForm(),
            name: 'Material #' + (this.chargeMaterial.length + 1),
            baselineHeatRequired: 0.0,
            modifiedHeatRequired: 0.0
          };
          this.calculateBaseline(tmpLoss);
          this.calculateModified(tmpLoss);
          this.chargeMaterial.unshift(tmpLoss);
        }
        else if (loss.inputs.chargeMaterialType == 'Liquid') {
          let tmpLoss = {
            chargeMaterialType: 'Liquid',
            solidForm:  this.chargeMaterialService.initSolidForm(),
            liquidForm: this.chargeMaterialService.getLiquidChargeMaterialForm(loss.inputs.liquidChargeMaterial),
            gasForm: this.chargeMaterialService.initGasForm(),
            name: 'Material #' + (this.chargeMaterial.length + 1),
            baselineHeatRequired: 0.0,
            modifiedHeatRequired: 0.0
          };
          this.calculateBaseline(tmpLoss);
          this.calculateModified(tmpLoss);
          this.chargeMaterial.unshift(tmpLoss);
        }
      })
    }
  }

  addMaterial() {
    this.chargeMaterial.unshift({
      chargeMaterialType: 'Solid',
      solidForm: this.chargeMaterialService.initSolidForm(),
      liquidForm: this.chargeMaterialService.initLiquidForm(),
      gasForm: this.chargeMaterialService.initGasForm(),
      name: 'Material #' + (this.chargeMaterial.length + 1),
      baselineHeatRequired: 0.0,
      modifiedHeatRequired: 0.0
    });
  }

  removeMaterial(str: string) {
    this.chargeMaterial = _.remove(this.chargeMaterial, material => {
      return material.name != str;
    });
    this.renameMaterial();
  }

  renameMaterial() {
    let index = 1;
    this.chargeMaterial.forEach(material => {
      material.name = 'Material #' + index;
      index++;
    })
  }

  calculateBaseline(loss: any) {
    if (loss.chargeMaterialType == 'Solid') {
      let reactionType = 0;
      if (loss.solidForm.value.baselineEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.baselineHeatRequired = this.phastService.solidLoadChargeMaterial(
        reactionType,
        loss.solidForm.value.baselineMaterialSpecificHeatOfSolidMaterial,
        loss.solidForm.value.baselineMaterialLatentHeatOfFusion,
        loss.solidForm.value.baselineMaterialHeatOfLiquid,
        loss.solidForm.value.baselineMaterialMeltingPoint,
        loss.solidForm.value.baselineFeedRate,
        loss.solidForm.value.baselineWaterContentAsCharged,
        loss.solidForm.value.baselineWaterContentAsDischarged,
        loss.solidForm.value.baselineInitialTemperature,
        loss.solidForm.value.baselineChargeMaterialDischargeTemperature,
        loss.solidForm.value.baselineWaterVaporDischargeTemperature,
        loss.solidForm.value.baselinePercentChargeMelted,
        loss.solidForm.value.baselinePercentChargeReacted,
        loss.solidForm.value.baselineHeatOfReaction,
        loss.solidForm.value.baselineAdditionalHeatRequired,

      );
    } else if (loss.chargeMaterialType == 'Liquid') {
      let reactionType = 0;
      if (loss.liquidForm.value.baselineEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.baselineHeatRequired = this.phastService.liquidLoadChargeMaterial(
        reactionType,
        loss.liquidForm.value.baselineMaterialSpecificHeatLiquid,
        loss.liquidForm.value.baselineMaterialVaporizingTemperature,
        loss.liquidForm.value.baselineMaterialLatentHeat,
        loss.liquidForm.value.baselineMaterialSpecificHeatVapor,
        loss.liquidForm.value.baselineFeedRate,
        loss.liquidForm.value.baselineInitialTemperature,
        loss.liquidForm.value.baselineDischargeTemperature,
        loss.liquidForm.value.baselineLiquidVaporized,
        loss.liquidForm.value.baselineLiquidReacted,
        loss.liquidForm.value.baselineHeatOfReaction,
        loss.liquidForm.value.baselineAdditionalHeatRequired
      )
    } else if (loss.chargeMaterialType == 'Gas') {
      let reactionType = 0;
      if (loss.gasForm.value.baselineEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.baselineHeatRequired = this.phastService.gasLoadChargeMaterial(
        reactionType,
        loss.gasForm.value.baselineMaterialSpecificHeat,
        loss.gasForm.value.baselineFeedRate,
        loss.gasForm.value.baselineVaporInGas,
        loss.gasForm.value.baselineInitialTemperature,
        loss.gasForm.value.baselineDischargeTemperature,
        loss.gasForm.value.baselineSpecificHeatOfVapor,
        loss.gasForm.value.baselineGasReacted,
        loss.gasForm.value.baselineHeatOfReaction,
        loss.gasForm.value.baselineAdditionalHeatRequired,
      )
    }
  }

  calculateModified(loss: any) {
    if (loss.chargeMaterialType == 'Solid') {
      let reactionType = 0;
      if (loss.solidForm.value.modifiedEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.modifiedHeatRequired = this.phastService.solidLoadChargeMaterial(
        reactionType,
        loss.solidForm.value.modifiedMaterialSpecificHeatOfSolidMaterial,
        loss.solidForm.value.modifiedMaterialLatentHeatOfFusion,
        loss.solidForm.value.modifiedMaterialHeatOfLiquid,
        loss.solidForm.value.modifiedMaterialMeltingPoint,
        loss.solidForm.value.modifiedFeedRate,
        loss.solidForm.value.modifiedWaterContentAsCharged,
        loss.solidForm.value.modifiedWaterContentAsDischarged,
        loss.solidForm.value.modifiedInitialTemperature,
        loss.solidForm.value.modifiedChargeMaterialDischargeTemperature,
        loss.solidForm.value.modifiedWaterVaporDischargeTemperature,
        loss.solidForm.value.modifiedPercentChargeMelted,
        loss.solidForm.value.modifiedPercentChargeReacted,
        loss.solidForm.value.modifiedHeatOfReaction,
        loss.solidForm.value.modifiedAdditionalHeatRequired,

      );
    } else if (loss.chargeMaterialType == 'Liquid') {
      let reactionType = 0;
      if (loss.liquidForm.value.modifiedEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.modifiedHeatRequired = this.phastService.liquidLoadChargeMaterial(
        reactionType,
        loss.liquidForm.value.modifiedMaterialSpecificHeatLiquid,
        loss.liquidForm.value.modifiedMaterialVaporizingTemperature,
        loss.liquidForm.value.modifiedMaterialLatentHeat,
        loss.liquidForm.value.modifiedMaterialSpecificHeatVapor,
        loss.liquidForm.value.modifiedFeedRate,
        loss.liquidForm.value.modifiedInitialTemperature,
        loss.liquidForm.value.modifiedDischargeTemperature,
        loss.liquidForm.value.modifiedLiquidVaporized,
        loss.liquidForm.value.modifiedLiquidReacted,
        loss.liquidForm.value.modifiedHeatOfReaction,
        loss.liquidForm.value.modifiedAdditionalHeatRequired
      )
    } else if (loss.chargeMaterialType == 'Gas') {
      let reactionType = 0;
      if (loss.gasForm.value.modifiedEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.modifiedHeatRequired = this.phastService.gasLoadChargeMaterial(
        reactionType,
        loss.gasForm.value.modifiedMaterialSpecificHeat,
        loss.gasForm.value.modifiedFeedRate,
        loss.gasForm.value.modifiedVaporInGas,
        loss.gasForm.value.modifiedInitialTemperature,
        loss.gasForm.value.modifiedDischargeTemperature,
        loss.gasForm.value.modifiedSpecificHeatOfVapor,
        loss.gasForm.value.modifiedGasReacted,
        loss.gasForm.value.modifiedHeatOfReaction,
        loss.gasForm.value.modifiedAdditionalHeatRequired
      )
    }
  }



}
