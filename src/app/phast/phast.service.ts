import { Injectable } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../shared/models/phast/efficiencyImprovement';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../shared/models/phast/energyEquivalency';
import { O2Enrichment } from '../shared/models/phast/o2Enrichment';
import { FlowCalculations } from '../shared/models/phast/flowCalculations';
import { ExhaustGasEAF } from '../shared/models/phast/losses/exhaustGasEAF';
import { PHAST, Losses } from '../shared/models/phast/phast';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { GasCoolingLoss, LiquidCoolingLoss, CoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial, ChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { OpeningLoss, CircularOpeningLoss, QuadOpeningLoss } from '../shared/models/phast/losses/openingLoss';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { AtmosphereLoss } from '../shared/models/phast/losses/atmosphereLoss';
import { Slag } from '../shared/models/phast/losses/slag';
import { AuxiliaryPowerLoss } from '../shared/models/phast/losses/auxiliaryPowerLoss';
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';
import { FlueGasByMass, FlueGasByVolume, FlueGas } from '../shared/models/phast/losses/flueGas';
import { ExtendedSurface } from '../shared/models/phast/losses/extendedSurface';
import { OtherLoss } from '../shared/models/phast/losses/otherLoss';
import { EnergyInputExhaustGasLoss } from '../shared/models/phast/losses/energyInputExhaustGasLosses';
declare var phastAddon: any;
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';

import { OpeningLossesService } from './losses/opening-losses/opening-losses.service';
import { AtmosphereLossesService } from './losses/atmosphere-losses/atmosphere-losses.service';
import { AuxiliaryPowerLossesService } from './losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { ChargeMaterialService } from './losses/charge-material/charge-material.service';
import { CoolingLossesService } from './losses/cooling-losses/cooling-losses.service';
import { WallLossesService } from './losses/wall-losses/wall-losses.service';
import { FixtureLossesService } from './losses/fixture-losses/fixture-losses.service';
import { GasLeakageLossesService } from './losses/gas-leakage-losses/gas-leakage-losses.service';
import { OtherLossesService } from './losses/other-losses/other-losses.service';
import { SlagService } from './losses/slag/slag.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../shared/models/materials';
import { StepTab, stepTabs, specTabs } from './tabs';
import * as _ from 'lodash';
@Injectable()
export class PhastService {

  mainTab: BehaviorSubject<string>;
  // secondaryTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<StepTab>;
  specTab: BehaviorSubject<StepTab>;
  calcTab: BehaviorSubject<string>;
  constructor(
    private openingLossesService: OpeningLossesService,
    private convertUnitsService: ConvertUnitsService,
    private atmosphereLossesService: AtmosphereLossesService,
    private auxiliaryPowerLossesService: AuxiliaryPowerLossesService,
    private chargeMaterialService: ChargeMaterialService,
    private coolingLossesService: CoolingLossesService,
    private wallLossesService: WallLossesService,
    private fixtureLossesService: FixtureLossesService,
    private gasLeakageLossesService: GasLeakageLossesService,
    private otherLossessService: OtherLossesService,
    private slagService: SlagService
  ) {
    this.initTabs();
  }
  initTabs() {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    //this.secondaryTab = new BehaviorSubject<string>('explore-opportunities');
    this.stepTab = new BehaviorSubject<StepTab>(stepTabs[0]);
    this.specTab = new BehaviorSubject<StepTab>(specTabs[0]);
    this.calcTab = new BehaviorSubject<string>('o2-enrichment');
  }

  goToStep(newStepNum: number) {
    let newStep = _.find(stepTabs, (tab) => { return tab.step == newStepNum });
    this.stepTab.next(newStep);
  }

  goToSpec(newSpec: number) {
    let newSpecTab = _.find(specTabs, (tab) => { return tab.step == newSpec });
    this.specTab.next(newSpecTab);
  }

  test() {
    console.log(phastAddon)
  }

  createInputCopy(inputs: any) {
    if (inputs) {
      let cpy = JSON.parse(JSON.stringify(inputs));
      return cpy;
    } else {
      return
    }
  }

  convertResult(val: number, to: string) {
    if (isNaN(val) == false) {
      val = this.convertUnitsService.value(val).from('Btu').to(to);
    } else {
      val = 0;
    }
    return val;
  }

  fixtureLosses(input: FixtureLoss, settings: Settings): number {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.finalTemperature = this.convertUnitsService.value(inputs.finalTemperature).from('C').to('F');
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      inputs.feedRate = this.convertUnitsService.value(inputs.feedRate).from('kg').to('lb');
      results = phastAddon.fixtureLosses(inputs);
    } else {
      results = phastAddon.fixtureLosses(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  gasCoolingLosses(input: GasCoolingLoss, settings: Settings): number {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m3').to('ft3');
      inputs.finalTemperature = this.convertUnitsService.value(inputs.finalTemperature).from('C').to('F');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.gasDensity = this.convertUnitsService.value(inputs.gasDensity).from('kgNm3').to('lbscf');
      results = phastAddon.gasCoolingLosses(inputs);
    }
    else {
      results = phastAddon.gasCoolingLosses(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  gasLoadChargeMaterial(input: GasChargeMaterial, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let netHeatLoss = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.dischargeTemperature = this.convertUnitsService.value(inputs.dischargeTemperature).from('C').to('F');
      inputs.feedRate = this.convertUnitsService.value(inputs.feedRate).from('kg').to('lb')
      inputs.reactionHeat = this.convertUnitsService.value(inputs.reactionHeat).from('kJkg').to('btuLb');
      inputs.additionalHeat = this.convertUnitsService.value(inputs.additionalHeat).from('kJ').to('Btu');
      inputs.specificHeatVapor = this.convertUnitsService.value(inputs.specificHeatVapor).from('kJkgC').to('btulbF');
      inputs.specificHeatGas = this.convertUnitsService.value(inputs.specificHeatGas).from('kJkgC').to('btulbF');
      netHeatLoss = phastAddon.gasLoadChargeMaterial(inputs);
    } else {
      netHeatLoss = phastAddon.gasLoadChargeMaterial(inputs);
    }

    netHeatLoss = this.convertResult(netHeatLoss, settings.energyResultUnit);
    const bindingResult = netHeatLoss;
    const isEndothermic = (input.thermicReactionType === 0);
    let endoExoHeat = (isEndothermic) ? input.percentReacted / 100 : -input.percentReacted / 100;
    endoExoHeat = this.convertUnitsService.value(endoExoHeat * inputs.feedRate * inputs.reactionHeat).from('Btu').to(settings.energyResultUnit);
    const grossHeatLoss = (isEndothermic) ? netHeatLoss : netHeatLoss + endoExoHeat;
    netHeatLoss = (isEndothermic) ? netHeatLoss - endoExoHeat : netHeatLoss;

    return {
      netHeatLoss: netHeatLoss,
      endoExoHeat: endoExoHeat,
      grossHeatLoss: grossHeatLoss,
      bindingResult: bindingResult
    };
  }

  liquidCoolingLosses(input: LiquidCoolingLoss, settings: Settings): number {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      inputs.density = this.convertUnitsService.value(inputs.density).from('kgL').to('lbgal');
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('L').to('gal');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.outletTemperature = this.convertUnitsService.value(inputs.outletTemperature).from('C').to('F');
      results = phastAddon.liquidCoolingLosses(inputs);
    }
    else {
      results = phastAddon.liquidCoolingLosses(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  liquidLoadChargeMaterial(input: LiquidChargeMaterial, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let netHeatLoss = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.vaporizingTemperature = this.convertUnitsService.value(inputs.vaporizingTemperature).from('C').to('F');
      inputs.latentHeat = this.convertUnitsService.value(inputs.latentHeat).from('kJkg').to('btuLb');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.dischargeTemperature = this.convertUnitsService.value(inputs.dischargeTemperature).from('C').to('F');
      inputs.chargeFeedRate = this.convertUnitsService.value(inputs.chargeFeedRate).from('kg').to('lb')
      inputs.reactionHeat = this.convertUnitsService.value(inputs.reactionHeat).from('kJkg').to('btuLb');
      inputs.additionalHeat = this.convertUnitsService.value(inputs.additionalHeat).from('kJ').to('Btu');
      inputs.specificHeatLiquid = this.convertUnitsService.value(inputs.specificHeatLiquid).from('kJkgC').to('btulbF');
      inputs.specificHeatVapor = this.convertUnitsService.value(inputs.specificHeatVapor).from('kJkgC').to('btulbF');
      netHeatLoss = phastAddon.liquidLoadChargeMaterial(inputs);
    } else {
      netHeatLoss = phastAddon.liquidLoadChargeMaterial(inputs);
    }

    netHeatLoss = this.convertResult(netHeatLoss, settings.energyResultUnit);
    const bindingResult = netHeatLoss;
    const isEndothermic = (input.thermicReactionType === 0);
    let endoExoHeat = (isEndothermic) ? input.percentReacted / 100 : -input.percentReacted / 100;
    endoExoHeat = this.convertUnitsService.value(endoExoHeat * inputs.chargeFeedRate * inputs.reactionHeat).from('Btu').to(settings.energyResultUnit);
    const grossHeatLoss = (isEndothermic) ? netHeatLoss : netHeatLoss + endoExoHeat;
    netHeatLoss = (isEndothermic) ? netHeatLoss - endoExoHeat : netHeatLoss;

    return {
      netHeatLoss: netHeatLoss,
      endoExoHeat: endoExoHeat,
      grossHeatLoss: grossHeatLoss,
      bindingResult: bindingResult
    };
  }


  // Calculates view factor for opening losses of either type
  viewFactorCalculation(input: any, settings: Settings): number {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.thickness = this.convertUnitsService.value(inputs.thickness).from('mm').to('in');
      if ('diameter' in inputs) {
        inputs.diameter = this.convertUnitsService.value(inputs.diameter).from('mm').to('in');
      } else {
        inputs.length = this.convertUnitsService.value(inputs.length).from('mm').to('in');
        inputs.width = this.convertUnitsService.value(inputs.width).from('mm').to('in');
      }
    }
    results = phastAddon.viewFactorCalculation(inputs);
    return results;
  }

  openingLossesQuad(input: QuadOpeningLoss, settings: Settings): number {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.insideTemperature = this.convertUnitsService.value(inputs.insideTemperature).from('C').to('F');
      inputs.thickness = this.convertUnitsService.value(inputs.thickness).from('mm').to('in');
      inputs.length = this.convertUnitsService.value(inputs.length).from('mm').to('in');
      inputs.width = this.convertUnitsService.value(inputs.width).from('mm').to('in');
      results = phastAddon.openingLossesQuad(inputs);
    } else {
      results = phastAddon.openingLossesQuad(inputs);
    }
    return this.convertResult(results, settings.energyResultUnit);
  }

  openingLossesCircular(input: CircularOpeningLoss, settings: Settings): number {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.insideTemperature = this.convertUnitsService.value(inputs.insideTemperature).from('C').to('F');
      inputs.thickness = this.convertUnitsService.value(inputs.thickness).from('mm').to('in');
      inputs.diameter = this.convertUnitsService.value(inputs.diameter).from('mm').to('in');
      results = phastAddon.openingLossesCircular(inputs);
    } else {
      results = phastAddon.openingLossesCircular(inputs);
    }
    return this.convertResult(results, settings.energyResultUnit);
  }

  solidLoadChargeMaterial(input: SolidChargeMaterial, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let netHeatLoss = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.meltingPoint = this.convertUnitsService.value(inputs.meltingPoint).from('C').to('F');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.dischargeTemperature = this.convertUnitsService.value(inputs.dischargeTemperature).from('C').to('F');
      inputs.waterVaporDischargeTemperature = this.convertUnitsService.value(inputs.waterVaporDischargeTemperature).from('C').to('F');
      inputs.chargeFeedRate = this.convertUnitsService.value(inputs.chargeFeedRate).from('kg').to('lb');
      inputs.reactionHeat = this.convertUnitsService.value(inputs.reactionHeat).from('kJkg').to('btuLb');
      inputs.additionalHeat = this.convertUnitsService.value(inputs.additionalHeat).from('kJ').to('Btu');
      inputs.specificHeatLiquid = this.convertUnitsService.value(inputs.specificHeatLiquid).from('kJkgC').to('btulbF');
      inputs.specificHeatSolid = this.convertUnitsService.value(inputs.specificHeatSolid).from('kJkgC').to('btulbF');
      inputs.latentHeat = this.convertUnitsService.value(inputs.latentHeat).from('kJkg').to('btuLb');
      netHeatLoss = phastAddon.solidLoadChargeMaterial(inputs);
    } else {
      netHeatLoss = phastAddon.solidLoadChargeMaterial(inputs);
    }

    netHeatLoss = this.convertResult(netHeatLoss, settings.energyResultUnit);
    const bindingResult = netHeatLoss;
    const isEndothermic = (input.thermicReactionType === 0);
    let endoExoHeat = (isEndothermic) ? input.chargeReacted / 100 : -input.chargeReacted / 100;
    endoExoHeat = this.convertUnitsService.value(endoExoHeat * inputs.chargeFeedRate * inputs.reactionHeat).from('Btu').to(settings.energyResultUnit);

    const grossHeatLoss = (isEndothermic) ? netHeatLoss : netHeatLoss + endoExoHeat;
    netHeatLoss = (isEndothermic) ? netHeatLoss - endoExoHeat : netHeatLoss;

    return {
      netHeatLoss: netHeatLoss,
      endoExoHeat: endoExoHeat,
      grossHeatLoss: grossHeatLoss,
      bindingResult: bindingResult
    };
  }

  wallLosses(input: WallLoss, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.surfaceTemperature = this.convertUnitsService.value(inputs.surfaceTemperature).from('C').to('F');
      inputs.windVelocity = this.convertUnitsService.value(inputs.windVelocity).from('km/h').to('mph');
      inputs.surfaceArea = this.convertUnitsService.value(inputs.surfaceArea).from('m2').to('ft2');
      results = phastAddon.wallLosses(inputs);
    } else {
      results = phastAddon.wallLosses(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }


  leakageLosses(input: LeakageLoss, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.draftPressure = this.convertUnitsService.value(inputs.draftPressure).from('Pa').to('inH2o')
      inputs.openingArea = this.convertUnitsService.value(inputs.openingArea).from('m2').to('ft2');
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.leakageGasTemperature = this.convertUnitsService.value(inputs.leakageGasTemperature).from('C').to('F');
      results = phastAddon.leakageLosses(inputs);
    } else {
      results = phastAddon.leakageLosses(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  flueGasByVolume(input: FlueGasByVolume, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.combustionAirTemperature = this.convertUnitsService.value(inputs.combustionAirTemperature).from('C').to('F');
      inputs.flueGasTemperature = this.convertUnitsService.value(inputs.flueGasTemperature).from('C').to('F');
      inputs.fuelTemperature = this.convertUnitsService.value(inputs.fuelTemperature).from('C').to('F');
      results = phastAddon.flueGasLossesByVolume(inputs);
    } else {
      results = phastAddon.flueGasLossesByVolume(inputs);
    }

    return results;
  }

  flueGasByMass(input: FlueGasByMass, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.combustionAirTemperature = this.convertUnitsService.value(inputs.combustionAirTemperature).from('C').to('F');
      inputs.flueGasTemperature = this.convertUnitsService.value(inputs.flueGasTemperature).from('C').to('F');
      inputs.ashDischargeTemperature = this.convertUnitsService.value(inputs.ashDischargeTemperature).from('C').to('F');
      inputs.fuelTemperature = this.convertUnitsService.value(inputs.fuelTemperature).from('C').to('F');
      results = phastAddon.flueGasLossesByMass(inputs);
    } else {
      results = phastAddon.flueGasLossesByMass(inputs);
    }
    return results;
  }

  flueGasCalculateExcessAir(input: any) {
    return phastAddon.flueGasCalculateExcessAir(input);
  }

  flueGasCalculateO2(input: any) {
    return phastAddon.flueGasCalculateO2(input);
  }

  flueGasByMassCalculateExcessAir(input: any) {
    return phastAddon.flueGasByMassCalculateExcessAir(input);
  }

  flueGasByMassCalculateO2(input: any) {
    return phastAddon.flueGasByMassCalculateO2(input);
  }

  atmosphere(input: AtmosphereLoss, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.inletTemperature = this.convertUnitsService.value(inputs.inletTemperature).from('C').to('F');
      inputs.outletTemperature = this.convertUnitsService.value(inputs.outletTemperature).from('C').to('F');
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m3/h').to('ft3/h')
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJm3C').to('btuScfF');
      results = phastAddon.atmosphere(inputs);
    } else {
      results = phastAddon.atmosphere(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  slagOtherMaterialLosses(input: Slag, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.weight = this.convertUnitsService.value(inputs.weight).from('kg').to('lb');
      inputs.inletTemperature = this.convertUnitsService.value(inputs.inletTemperature).from('C').to('F');
      inputs.outletTemperature = this.convertUnitsService.value(inputs.outletTemperature).from('C').to('F');
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      results = phastAddon.slagOtherMaterialLosses(inputs);
    } else {
      results = phastAddon.slagOtherMaterialLosses(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  auxiliaryPowerLoss(inputs: AuxiliaryPowerLoss) {
    //No Conversions
    return phastAddon.auxiliaryPowerLoss(inputs);
  }

  //Electric Arc Furnace
  energyInputEAF(input: EnergyInputEAF, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = {
      heatDelivered: 0,
      totalChemicalEnergyInput: 0
    };
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.naturalGasHeatInput = this.convertUnitsService.value(inputs.naturalGasHeatInput).from('GJ').to('MMBtu');
      inputs.otherFuels = this.convertUnitsService.value(inputs.otherFuels).from('GJ').to('MMBtu');
      inputs.coalCarbonInjection = this.convertUnitsService.value(inputs.coalCarbonInjection).from('kg').to('lb');
      inputs.coalHeatingValue = this.convertUnitsService.value(inputs.coalHeatingValue).from('kJkg').to('btuLb');
      inputs.electrodeHeatingValue = this.convertUnitsService.value(inputs.electrodeHeatingValue).from('kJkg').to('btuLb');
      inputs.electrodeUse = this.convertUnitsService.value(inputs.electrodeUse).from('kg').to('lb');
      results = phastAddon.energyInputEAF(inputs);
    } else {
      results = phastAddon.energyInputEAF(inputs);
    }
    results.totalChemicalEnergyInput = this.convertResult(results.totalChemicalEnergyInput, settings.energyResultUnit);
    results.heatDelivered = this.convertResult(results.heatDelivered, settings.energyResultUnit);
    return results;
  }

  //Electric Arc Furnace
  exhaustGasEAF(input: ExhaustGasEAF, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results = 0;
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.offGasTemp = this.convertUnitsService.value(inputs.offGasTemp).from('C').to('F');
      inputs.vfr = this.convertUnitsService.value(inputs.vfr).from('m3').to('ft3');
      inputs.dustLoading = this.convertUnitsService.value(inputs.dustLoading).from('kgNm3').to('lbscf');
      results = phastAddon.exhaustGasEAF(inputs);
    } else {
      results = phastAddon.exhaustGasEAF(inputs);
    }
    results = this.convertResult(results, settings.energyResultUnit);
    return results;
  }

  //energy input for non-EAF Electric process heating
  energyInputExhaustGasLosses(input: EnergyInputExhaustGasLoss, settings: Settings) {
    let inputs = this.createInputCopy(input);
    let results: any = {
      heatDelivered: 0,
      exhaustGasLosses: 0
    };
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.combustionAirTemp = this.convertUnitsService.value(inputs.combustionAirTemp).from('C').to('F');
      inputs.exhaustGasTemp = this.convertUnitsService.value(inputs.exhaustGasTemp).from('C').to('F');
      inputs.totalHeatInput = this.convertUnitsService.value(inputs.totalHeatInput).from('GJ').to('Btu');
      results = phastAddon.energyInputExhaustGasLosses(inputs);
    } else {
      inputs.totalHeatInput = this.convertUnitsService.value(inputs.totalHeatInput).from('MMBtu').to('Btu');
      results = phastAddon.energyInputExhaustGasLosses(inputs);
    }
    results.heatDelivered = this.convertResult(results.heatDelivered, settings.energyResultUnit);
    results.exhaustGasLosses = this.convertResult(results.exhaustGasLosses, settings.energyResultUnit);

    return results;
  }

  efficiencyImprovement(input: EfficiencyImprovementInputs, settings: Settings) {
    let inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.currentCombustionAirTemp = this.convertUnitsService.value(inputs.currentCombustionAirTemp).from('C').to('F')
      inputs.currentFlueGasTemp = this.convertUnitsService.value(inputs.currentFlueGasTemp).from('C').to('F')
      inputs.newCombustionAirTemp = this.convertUnitsService.value(inputs.newCombustionAirTemp).from('C').to('F')
      inputs.newFlueGasTemp = this.convertUnitsService.value(inputs.newFlueGasTemp).from('C').to('F')
      inputs.currentEnergyInput = this.convertUnitsService.value(inputs.currentEnergyInput).from('GJ').to('MMBtu');
      let results: EfficiencyImprovementOutputs = phastAddon.efficiencyImprovement(inputs);
      results.newEnergyInput = this.convertUnitsService.value(results.newEnergyInput).from('MMBtu').to('GJ');
      return results;
    } else {
      return phastAddon.efficiencyImprovement(inputs);
    }
  }

  energyEquivalencyElectric(input: EnergyEquivalencyElectric, settings: Settings) {
    let inputs = this.createInputCopy(input)
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.fuelFiredHeatInput = this.convertUnitsService.value(inputs.fuelFiredHeatInput).from('GJ').to('MMBtu');
    }
    return phastAddon.energyEquivalencyElectric(inputs);
  }

  energyEquivalencyFuel(inputs: EnergyEquivalencyFuel, settings: Settings) {
    let results = phastAddon.energyEquivalencyFuel(inputs);
    if (settings.unitsOfMeasure == 'Metric') {
      results.fuelFiredHeatInput = this.convertUnitsService.value(results.fuelFiredHeatInput).from('MMBtu').to('GJ');
    }
    return results;
  }

  flowCalculations(input: FlowCalculations, settings: Settings) {
    let inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure == 'Metric') {
      //cm -> in
      inputs.orificeDiameter = this.convertUnitsService.value(inputs.orificeDiameter).from('cm').to('in');
      inputs.insidePipeDiameter = this.convertUnitsService.value(inputs.insidePipeDiameter).from('cm').to('in');
      inputs.orificePressureDrop = this.convertUnitsService.value(inputs.orificePressureDrop).from('cm').to('in');
      //C -> F
      inputs.gasTemperature = this.convertUnitsService.value(inputs.gasTemperature).from('C').to('F');
      //kPa -> Psig
      inputs.gasPressure = this.convertUnitsService.value(inputs.gasPressure).from('kPa').to('psi');
      //kJNm3 -> btuSCF
      inputs.gasHeatingValue = this.convertUnitsService.value(inputs.gasHeatingValue).from('kJNm3').to('btuSCF');
      let results = phastAddon.flowCalculations(inputs);
      results.flow = this.convertUnitsService.value(results.flow).from('ft3').to('m3')
      results.totalFlow = this.convertUnitsService.value(results.totalFlow).from('ft3').to('m3')
      results.heatInput = this.convertUnitsService.value(results.heatInput).from('MMBtu').to('GJ')
      return results;
    } else {
      return phastAddon.flowCalculations(inputs);
    }
  }

  o2Enrichment(input: O2Enrichment, settings: Settings) {
    let inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure == 'Metric') {
      inputs.combAirTemp = this.convertUnitsService.value(inputs.combAirTemp).from('C').to('F');
      inputs.flueGasTemp = this.convertUnitsService.value(inputs.flueGasTemp).from('C').to('F');
      inputs.combAirTempEnriched = this.convertUnitsService.value(inputs.combAirTempEnriched).from('C').to('F');
      inputs.flueGasTempEnriched = this.convertUnitsService.value(inputs.flueGasTempEnriched).from('C').to('F');
      inputs.fuelConsumption = this.convertUnitsService.value(inputs.combAirTemp).from('GJ').to('MMBtu');
      let results = phastAddon.o2Enrichment(inputs);
      results.fuelConsumptionEnriched = this.convertUnitsService.value(results.fuelConsumptionEnriched).from('MMBtu').to('GJ');
      return results;
    } else {
      return phastAddon.o2Enrichment(inputs);
    }
  }

  flueGasByVolumeCalculateHeatingValue(inputs: FlueGasMaterial) {
    return phastAddon.flueGasByVolumeCalculateHeatingValue(inputs);
  }

  flueGasByMassCalculateHeatingValue(inputs: SolidLiquidFlueGasMaterial) {
    return phastAddon.flueGasByMassCalculateHeatingValue(inputs);
  }

  //TODO:Functions in addon need to be implemented
  // humidityRatio
  // flueGasLossesByMassGivenO2
  // flueGasLossesByVolumeGivenO2

  sumHeatInput(losses: Losses, settings: Settings): number {
    let grossHeatRequired: number = 0;
    if (losses.atmosphereLosses) {
      grossHeatRequired += this.sumAtmosphereLosses(losses.atmosphereLosses, settings);
    }
    if (losses.auxiliaryPowerLosses) {
      grossHeatRequired += this.sumAuxilaryPowerLosses(losses.auxiliaryPowerLosses);
    }
    if (losses.chargeMaterials) {
      grossHeatRequired += this.sumChargeMaterials(losses.chargeMaterials, settings);
    }
    if (losses.coolingLosses) {
      grossHeatRequired += this.sumCoolingLosses(losses.coolingLosses, settings);
    }
    if (losses.extendedSurfaces) {
      grossHeatRequired += this.sumExtendedSurface(losses.extendedSurfaces, settings);
    }
    if (losses.fixtureLosses) {
      grossHeatRequired += this.sumFixtureLosses(losses.fixtureLosses, settings);
    }
    if (losses.leakageLosses) {
      grossHeatRequired += this.sumLeakageLosses(losses.leakageLosses, settings);
    }
    if (losses.openingLosses) {
      grossHeatRequired += this.sumOpeningLosses(losses.openingLosses, settings);
    }
    if (losses.otherLosses) {
      grossHeatRequired += this.sumOtherLosses(losses.otherLosses);
    }
    if (losses.slagLosses) {
      grossHeatRequired += this.sumSlagLosses(losses.slagLosses, settings);
    }
    if (losses.wallLosses) {
      grossHeatRequired += this.sumWallLosses(losses.wallLosses, settings);
    }
    if (losses.energyInputExhaustGasLoss) {
      let tmpResults = this.energyInputExhaustGasLosses(losses.energyInputExhaustGasLoss[0], settings)
      grossHeatRequired += tmpResults.exhaustGasLosses;
    }
    if (losses.exhaustGasEAF) {
      grossHeatRequired += this.sumExhaustGasEAF(losses.exhaustGasEAF, settings);
    }
    return grossHeatRequired;
  }

  sumAtmosphereLosses(losses: AtmosphereLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.atmosphereLossesService.getAtmosphereForm(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.atmosphere(loss, settings);
      }
    });
    return sum;
  }

  sumAuxilaryPowerLosses(losses: AuxiliaryPowerLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.auxiliaryPowerLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.auxiliaryPowerLoss(loss);
      }
    });
    return sum;
  }

  sumChargeMaterials(losses: ChargeMaterial[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.chargeMaterialType == 'Gas') {
        let tmpForm = this.chargeMaterialService.getGasChargeMaterialForm(loss);
        if (tmpForm.status == 'VALID') {
          sum += this.gasLoadChargeMaterial(loss.gasChargeMaterial, settings).bindingResult;
        }
      } else if (loss.chargeMaterialType == 'Solid') {
        let tmpForm = this.chargeMaterialService.getSolidChargeMaterialForm(loss);
        if (tmpForm.status == 'VALID') {
          sum += this.solidLoadChargeMaterial(loss.solidChargeMaterial, settings).bindingResult;
        }
      } else if (loss.chargeMaterialType == 'Liquid') {
        let tmpForm = this.chargeMaterialService.getLiquidChargeMaterialForm(loss);
        if (tmpForm.status == 'VALID') {
          sum += this.liquidLoadChargeMaterial(loss.liquidChargeMaterial, settings).bindingResult;
        }
      }
    });
    return sum;
  }

  sumCoolingLosses(losses: CoolingLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      if (loss.coolingLossType == 'Gas') {
        let tmpForm = this.coolingLossesService.initGasFormFromLoss(loss);
        if (tmpForm.status == 'VALID') {
          sum += this.gasCoolingLosses(loss.gasCoolingLoss, settings);
        }
      } else if (loss.coolingLossType == 'Liquid') {
        let tmpForm = this.coolingLossesService.initLiquidFormFromLoss(loss);
        if (tmpForm.status == 'VALID') {
          sum += this.liquidCoolingLosses(loss.liquidCoolingLoss, settings);
        }
      }
    })
    return sum;
  }

  sumEnergyInputEAF(losses: EnergyInputEAF[], settings: Settings): number {
    let sum: any = {
      heatDelivered: 0,
      kwhCycle: 0,
      totalKwhCycle: 0
    };
    losses.forEach(loss => {
      let tmpResult = this.energyInputEAF(loss, settings);
      sum.heatDelivered += tmpResult.heatDelivered;
    })
    return sum.heatDelivered;
  }

  sumExhaustGasEAF(losses: ExhaustGasEAF[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      sum += this.exhaustGasEAF(loss, settings);
    })
    return sum;
  }

  sumEnergyInputExhaustGas(losses: EnergyInputExhaustGasLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let result = this.energyInputExhaustGasLosses(loss, settings);
      sum += result.heatDelivered;
    })
    return sum;
  }

  sumExtendedSurface(losses: ExtendedSurface[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpWallLoss: WallLoss = {
        surfaceArea: loss.surfaceArea,
        ambientTemperature: loss.ambientTemperature,
        surfaceTemperature: loss.surfaceTemperature,
        windVelocity: 5,
        surfaceEmissivity: loss.surfaceEmissivity,
        conditionFactor: 1,
        correctionFactor: 1,
      }
      let tmpForm = this.wallLossesService.getWallLossForm(tmpWallLoss);
      if (tmpForm.status == 'VALID') {
        let lossVal = this.wallLosses(tmpWallLoss, settings);
        if (isNaN(lossVal) == false) {
          sum += this.wallLosses(tmpWallLoss, settings);
        }
      }
    })
    return sum;
  }

  sumFixtureLosses(losses: FixtureLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.fixtureLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.fixtureLosses(loss, settings);
      }
    })
    return sum;
  }

  // sumFlueGasLosses(losses: FlueGas[]): number {
  //   let sum = 0;
  //   losses.forEach(loss => {
  //     if (loss.flueGasType == 'By Mass') {
  //       sum += this.flueGasByMass(loss.flueGasByMass);
  //     } else if (loss.flueGasType == 'By Volume') {
  //       sum += this.flueGasByVolume(loss.flueGasByVolume);
  //     }
  //   })
  //   return sum;
  // }

  sumLeakageLosses(losses: LeakageLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.gasLeakageLossesService.initFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.leakageLosses(loss, settings);
      }
    })
    return sum;
  }

  sumOpeningLosses(losses: OpeningLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.openingLossesService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        if (loss.openingType == 'Round') {
          let tmpLoss = this.openingLossesService.getCircularLossFromForm(tmpForm);
          sum += this.openingLossesCircular(tmpLoss, settings) * loss.numberOfOpenings;
        } else if (loss.openingType == 'Rectangular (Square)') {
          let tmpLoss = this.openingLossesService.getQuadLossFromForm(tmpForm);
          sum += this.openingLossesQuad(tmpLoss, settings) * loss.numberOfOpenings;
        }
      }
    });

    return sum;
  }

  sumOtherLosses(losses: OtherLoss[]): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.otherLossessService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += loss.heatLoss;
      }
    })
    return sum;
  }

  sumSlagLosses(losses: Slag[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.slagService.getFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.slagOtherMaterialLosses(loss, settings);
      }
    })
    return sum;
  }

  sumWallLosses(losses: WallLoss[], settings: Settings): number {
    let sum = 0;
    losses.forEach(loss => {
      let tmpForm = this.wallLossesService.getWallLossForm(loss);
      if (tmpForm.status == 'VALID') {
        sum += this.wallLosses(loss, settings);
      }
    })
    return sum;
  }

  sumChargeMaterialFeedRate(materials: ChargeMaterial[]): number {
    let sum = 0;
    if (materials) {
      materials.forEach(material => {
        if (material.chargeMaterialType == 'Gas') {
          sum += material.gasChargeMaterial.feedRate;
        } else if (material.chargeMaterialType == 'Solid') {
          sum += material.solidChargeMaterial.chargeFeedRate;
        } else if (material.chargeMaterialType == 'Liquid') {
          sum += material.liquidChargeMaterial.chargeFeedRate;
        }
      })
    }
    return sum;
  }

  sumChargeMaterialExothermic(materials: ChargeMaterial[], settings: Settings): number {
    let sumAdditionalHeat = 0;
    if (materials) {
      materials.forEach(val => {
        if (val.chargeMaterialType == 'Solid') {
          if (val.solidChargeMaterial.thermicReactionType == 1) {
            sumAdditionalHeat += ((val.solidChargeMaterial.chargeFeedRate * val.solidChargeMaterial.reactionHeat * val.solidChargeMaterial.chargeReacted) / 100);
          }
        } else if (val.chargeMaterialType == 'Liquid') {
          if (val.liquidChargeMaterial.thermicReactionType == 1) {
            sumAdditionalHeat += ((val.liquidChargeMaterial.chargeFeedRate * val.liquidChargeMaterial.reactionHeat * val.liquidChargeMaterial.percentReacted) / 100);
          }
        } else if (val.chargeMaterialType == 'Gas') {
          if (val.gasChargeMaterial.thermicReactionType == 1) {
            sumAdditionalHeat += ((val.gasChargeMaterial.feedRate * val.gasChargeMaterial.reactionHeat * val.gasChargeMaterial.percentReacted) / 100);
          }
        }
      })
    }
    if (sumAdditionalHeat != 0) {
      if (settings.unitsOfMeasure == 'Imperial') {
        sumAdditionalHeat = this.convertUnitsService.value(sumAdditionalHeat).from('Btu').to(settings.energyResultUnit);
      } else if (settings.unitsOfMeasure == 'Metric') {
        sumAdditionalHeat = this.convertUnitsService.value(sumAdditionalHeat).from('kJ').to(settings.energyResultUnit);
      }
    }

    return sumAdditionalHeat;
  }

  sumGrossHeat(losses: Losses) {

  }

  // sumAuxiliaryEquipment(phast: PHAST, results: Array<any>) {
  //   let sum = 0;
  //   results.forEach(result => {
  //     if (result.motorPower == 'Calculated') {
  //       sum += result.totalPower;
  //     } else if (result.motorPower == 'Rated') {
  //       if (result.totalPower != 0) {
  //         let convert = this.convertUnitsService.value(result.totalPower).from('hp').to('kW');
  //         sum += convert;
  //       }
  //     }
  //   })
  //   return sum;
  // }
}

