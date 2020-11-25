import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult } from '../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ChargeMaterialService {
  baselineData: BehaviorSubject<ChargeMaterial>;
  modificationData: BehaviorSubject<ChargeMaterial>;
  output: BehaviorSubject<ChargeMaterialOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<ChargeMaterial>(undefined);
    this.modificationData = new BehaviorSubject<ChargeMaterial>(undefined);
    this.output = new BehaviorSubject<ChargeMaterialOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineChargeMaterial = this.baselineData.getValue();
    let modificationChargeMaterial = this.modificationData.getValue();

    let output: ChargeMaterialOutput = this.output.getValue();
    let baselineResults: ChargeMaterialResult = this.getChargeMaterialResult(baselineChargeMaterial, settings);
    if (baselineResults) {
      output.baseline = baselineResults;
    }
    if (modificationChargeMaterial) {
      let modificationResults: ChargeMaterialResult = this.getChargeMaterialResult(modificationChargeMaterial, settings);
      if (modificationResults) {
        output.modification = modificationResults;
      }
    }
    this.output.next(output);
  }

  getChargeMaterialResult(chargeMaterialData: ChargeMaterial, settings: Settings): ChargeMaterialResult {
    let result: ChargeMaterialResult = {
      heatRequired: 0,
      netHeatLoss: 0,
      endoExoHeat: 0,
      grossLoss: 0
    }
    if (chargeMaterialData.chargeMaterialType == 'Gas' && chargeMaterialData.gasChargeMaterial) {
      let calculated = this.phastService.gasLoadChargeMaterial(chargeMaterialData.gasChargeMaterial, settings);
      result.heatRequired = calculated.grossHeatLoss;
      result.netHeatLoss = calculated.netHeatLoss;
      result.endoExoHeat = calculated.endoExoHeat;
      result.grossLoss =  (calculated.grossHeatLoss / chargeMaterialData.gasChargeMaterial.availableHeat) * 100;
    } else if (chargeMaterialData.chargeMaterialType == 'Liquid' && chargeMaterialData.liquidChargeMaterial) {
      let calculated = this.phastService.liquidLoadChargeMaterial(chargeMaterialData.liquidChargeMaterial, settings);
      result.heatRequired = calculated.grossHeatLoss;
      result.netHeatLoss = calculated.netHeatLoss;
      result.endoExoHeat = calculated.endoExoHeat;
      result.grossLoss =  (calculated.grossHeatLoss / chargeMaterialData.liquidChargeMaterial.availableHeat) * 100;
    }  else if (chargeMaterialData.chargeMaterialType == 'Solid' && chargeMaterialData.solidChargeMaterial) {
      let calculated = this.phastService.solidLoadChargeMaterial(chargeMaterialData.solidChargeMaterial, settings);
      result.heatRequired = calculated.grossHeatLoss;
      result.netHeatLoss = calculated.netHeatLoss;
      result.endoExoHeat = calculated.endoExoHeat;
      result.grossLoss =  (calculated.grossHeatLoss / chargeMaterialData.solidChargeMaterial.availableHeat) * 100;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: ChargeMaterial = {
      chargeMaterialType: '',
      liquidChargeMaterial: undefined,
      gasChargeMaterial: undefined,
      solidChargeMaterial: undefined,
      name: undefined
    };
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
  }

  initDefaultEmptyOutput() {
     let output: ChargeMaterialOutput = {
      baseline: {
        heatRequired: 0,
        netHeatLoss: 0,
        endoExoHeat: 0,
        grossLoss: 0
      },
      modification: {
        heatRequired: 0,
        netHeatLoss: 0,
        endoExoHeat: 0,
        grossLoss: 0
      }
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: ChargeMaterial = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: ChargeMaterial;

    if (currentBaselineCopy.chargeMaterialType == 'Gas') {
      modification = {
        chargeMaterialType: 'Gas',
        liquidChargeMaterial: undefined,
        gasChargeMaterial: currentBaselineCopy.gasChargeMaterial,
        solidChargeMaterial: undefined,
        name: undefined
      };
    } else if (currentBaselineCopy.chargeMaterialType == 'Liquid'){
      modification = {
        chargeMaterialType: 'Liquid',
        liquidChargeMaterial: currentBaselineCopy.liquidChargeMaterial,
        gasChargeMaterial: undefined,
        solidChargeMaterial: undefined,
        name: undefined
      };
    } else {
      modification = {
        chargeMaterialType: 'Solid',
        liquidChargeMaterial: undefined,
        gasChargeMaterial: undefined,
        solidChargeMaterial: currentBaselineCopy.solidChargeMaterial,
        name: undefined
      };
    }
    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
    // TODO conversions
    let baselineChargeMaterial: ChargeMaterial = {
      name: undefined,
      chargeMaterialType: 'Solid',
      solidChargeMaterial: {
        materialId: 1,
        thermicReactionType: 0,
        specificHeatSolid: .16,
        latentHeat: 60,
        specificHeatLiquid: .175,
        meltingPoint: 2800,
        chargeFeedRate: 400000,
        waterContentCharged: 0,
        waterContentDischarged: 0,
        initialTemperature: 60,
        dischargeTemperature: 2300,
        waterVaporDischargeTemperature: 0,
        chargeMelted: 0,
        chargeReacted: 1,
        reactionHeat: 50,
        additionalHeat: 0
      }
    };

    let modificationChargeMaterial: ChargeMaterial = {
      name: undefined,
      chargeMaterialType: 'Solid',
      solidChargeMaterial: {
        materialId: 1,
        thermicReactionType: 0,
        specificHeatSolid: .16,
        latentHeat: 60,
        specificHeatLiquid: .175,
        meltingPoint: 2800,
        chargeFeedRate: 400000,
        waterContentCharged: 0,
        waterContentDischarged: 0,
        initialTemperature: 60,
        dischargeTemperature: 1800,
        waterVaporDischargeTemperature: 0,
        chargeMelted: 0,
        chargeReacted: 1,
        reactionHeat: 50,
        additionalHeat: 0
      }
    }
    this.baselineData.next(baselineChargeMaterial);
    this.modificationData.next(modificationChargeMaterial);
    this.generateExample.next(true);
  }

}