import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { AeratorPerformanceData, WasteWaterData, ActivatedSludgeData, WasteWaterOperations } from '../../shared/models/waste-water';
import { Co2SavingsDifferent } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';

@Injectable()
export class CompareService {

  wasteWaterDifferent: BehaviorSubject<WasteWaterDifferent>;
  co2SavingsDifferent: BehaviorSubject<Co2SavingsDifferent>;
  constructor() {
    this.wasteWaterDifferent = new BehaviorSubject<WasteWaterDifferent>(undefined);
    this.co2SavingsDifferent = new BehaviorSubject<Co2SavingsDifferent>(undefined);
  }

  setWasteWaterDifferent(baselineData: WasteWaterData, modificationData?: WasteWaterData) {
    let wasteWaterDifferent: WasteWaterDifferent = this.compareBaselineModification(baselineData, modificationData);
    this.wasteWaterDifferent.next(wasteWaterDifferent);
  }

  compareBaselineModification(baselineData: WasteWaterData, modificationData?: WasteWaterData): WasteWaterDifferent {
    let operationsDifferent: OperationsDifferent;
    let co2DataDifferent: CO2DataDifferent;
    let activatedSludgeDifferent: ActivatedSludgeDifferent;
    let aeratorPerformanceDifferent: AeratorPerformanceDifferent;
    let isDifferent: boolean = false;
    if (modificationData) {
      operationsDifferent = this.compareOperations(baselineData.operations, modificationData.operations);
      co2DataDifferent = this.compareCo2SavingsData(baselineData.co2SavingsData, modificationData.co2SavingsData);
      activatedSludgeDifferent = this.compareActivatedSludge(baselineData.activatedSludgeData, modificationData.activatedSludgeData);
      aeratorPerformanceDifferent = this.compareAeratorPerformance(baselineData.aeratorPerformanceData, modificationData.aeratorPerformanceData);
      isDifferent = this.checkHasDifferent(activatedSludgeDifferent) || this.checkHasDifferent(aeratorPerformanceDifferent) || this.checkHasDifferent(co2DataDifferent);
    } else {
      //compare baseline with baseline, all will come back false
      operationsDifferent = this.compareOperations(baselineData.operations, baselineData.operations);
      activatedSludgeDifferent = this.compareActivatedSludge(baselineData.activatedSludgeData, baselineData.activatedSludgeData);
      aeratorPerformanceDifferent = this.compareAeratorPerformance(baselineData.aeratorPerformanceData, baselineData.aeratorPerformanceData);
    }
    return {
      operationsDifferent: operationsDifferent,
      co2DataDifferent: co2DataDifferent,
      activatedSludgeDifferent: activatedSludgeDifferent,
      aeratorPerformanceDifferent: aeratorPerformanceDifferent,
      isDifferent: isDifferent
    }
  }

  compareOperations(baselineData: WasteWaterOperations, modificationData: WasteWaterOperations): OperationsDifferent {
    return {
      MaxDays: baselineData.MaxDays != modificationData.MaxDays, 
      operatingMonths: baselineData.operatingMonths != modificationData.operatingMonths,
      EnergyCostUnit: baselineData.EnergyCostUnit != modificationData.EnergyCostUnit
    }
  }

  compareCo2SavingsData(baselineCo2Data: Co2SavingsData, modificationCo2Data: Co2SavingsData): CO2DataDifferent {
    if(baselineCo2Data && modificationCo2Data){
      return {
        totalEmissionOutputRate: baselineCo2Data.totalEmissionOutputRate != modificationCo2Data.totalEmissionOutputRate, 
      }
    }else{
      return {
        totalEmissionOutputRate: false
      }
    }
  }

  isCo2SavingsDifferent(baseline?: Co2SavingsData, modification?: Co2SavingsData): void {
    let co2SavingsDifferent = {
      totalEmissionOutputRate: false,
    }
    if (baseline && modification) {
      if (baseline && modification) {
        co2SavingsDifferent = {
          totalEmissionOutputRate: baseline.totalEmissionOutputRate != modification.totalEmissionOutputRate,
        }
      }
    }
    debugger;
    this.co2SavingsDifferent.next(co2SavingsDifferent);
  }

  compareAeratorPerformance(baselineData: AeratorPerformanceData, modificationData: AeratorPerformanceData): AeratorPerformanceDifferent {
    return {
      OperatingDO: baselineData.OperatingDO != modificationData.OperatingDO,
      Alpha: baselineData.Alpha != modificationData.Alpha,
      Beta: baselineData.Beta != modificationData.Beta,
      SOTR: baselineData.SOTR != modificationData.SOTR,
      Aeration: baselineData.Aeration != modificationData.Aeration,
      Elevation: baselineData.Elevation != modificationData.Elevation,
      OperatingTime: baselineData.OperatingTime != modificationData.OperatingTime,
      TypeAerators: baselineData.TypeAerators != modificationData.TypeAerators,
      Aerator: baselineData.Aerator != modificationData.Aerator,
      Speed: baselineData.Speed != modificationData.Speed,
      AnoxicZoneCondition: baselineData.AnoxicZoneCondition != modificationData.AnoxicZoneCondition,
    }
  }

  compareActivatedSludge(baselineData: ActivatedSludgeData, modificationData: ActivatedSludgeData): ActivatedSludgeDifferent {
    return {
      Temperature: baselineData.Temperature != modificationData.Temperature,
      So: baselineData.So != modificationData.So,
      Volume: baselineData.Volume != modificationData.Volume,
      FlowRate: baselineData.FlowRate != modificationData.FlowRate,
      InertVSS: baselineData.InertVSS != modificationData.InertVSS,
      OxidizableN: baselineData.OxidizableN != modificationData.OxidizableN,
      Biomass: baselineData.Biomass != modificationData.Biomass,
      InfluentTSS: baselineData.InfluentTSS != modificationData.InfluentTSS,
      InertInOrgTSS: baselineData.InertInOrgTSS != modificationData.InertInOrgTSS,
      EffluentTSS: baselineData.EffluentTSS != modificationData.EffluentTSS,
      RASTSS: baselineData.RASTSS != modificationData.RASTSS,
      MLSSpar: baselineData.MLSSpar != modificationData.MLSSpar || baselineData.CalculateGivenSRT != modificationData.CalculateGivenSRT,
      FractionBiomass: baselineData.FractionBiomass != modificationData.FractionBiomass,
      BiomassYeild: baselineData.BiomassYeild != modificationData.BiomassYeild,
      HalfSaturation: baselineData.HalfSaturation != modificationData.HalfSaturation,
      MicrobialDecay: baselineData.MicrobialDecay != modificationData.MicrobialDecay,
      MaxUtilizationRate: baselineData.MaxUtilizationRate != modificationData.MaxUtilizationRate,
      DefinedSRT: baselineData.DefinedSRT != modificationData.DefinedSRT || baselineData.CalculateGivenSRT != modificationData.CalculateGivenSRT,
      CalculateGivenSRT: baselineData.CalculateGivenSRT != modificationData.CalculateGivenSRT
    }
  }

  getBadges(baselineData: WasteWaterData, modificationData: WasteWaterData): Array<{ badge: string, componentStr: string }> {
    let badges: Array<{ badge: string, componentStr: string }> = [];
    let wasteWaterDifferent: WasteWaterDifferent = this.compareBaselineModification(baselineData, modificationData);
    if (this.checkHasDifferent(wasteWaterDifferent.activatedSludgeDifferent)) {
      badges.push({ badge: 'Activated Sludge', componentStr: 'activated-sludge' });
    }
    if (this.checkHasDifferent(wasteWaterDifferent.aeratorPerformanceDifferent)) {
      badges.push({ badge: 'Aerator Performance', componentStr: 'aerator-performance' });
    }
    if (this.checkHasDifferent(wasteWaterDifferent.operationsDifferent) || this.checkHasDifferent(wasteWaterDifferent.co2DataDifferent)) {
      badges.push({ badge: 'Operations', componentStr: 'operations' });
    }
    return badges;
  }

  checkHasDifferent(obj: any): boolean {
    let hasDifferent: boolean = false;
    for (let key in obj) {
      if (obj[key] == true) {
        hasDifferent = true;
      }
    }
    return hasDifferent;
  }

}


export interface WasteWaterDifferent {
  operationsDifferent: OperationsDifferent,
  co2DataDifferent: CO2DataDifferent,
  activatedSludgeDifferent: ActivatedSludgeDifferent,
  aeratorPerformanceDifferent: AeratorPerformanceDifferent,
  isDifferent: boolean
}


export interface ActivatedSludgeDifferent {
  Temperature: boolean,
  So: boolean,
  Volume: boolean,
  FlowRate: boolean,
  InertVSS: boolean,
  OxidizableN: boolean,
  Biomass: boolean,
  InfluentTSS: boolean,
  InertInOrgTSS: boolean,
  EffluentTSS: boolean,
  RASTSS: boolean,
  MLSSpar: boolean,
  FractionBiomass: boolean,
  BiomassYeild: boolean,
  HalfSaturation: boolean,
  MicrobialDecay: boolean,
  MaxUtilizationRate: boolean,
  CalculateGivenSRT: boolean,
  DefinedSRT: boolean
}

export interface AeratorPerformanceDifferent {
  OperatingDO: boolean,
  Alpha: boolean,
  Beta: boolean,
  SOTR: boolean,
  Aeration: boolean,
  Elevation: boolean,
  OperatingTime: boolean,
  TypeAerators: boolean,
  Aerator: boolean,
  Speed: boolean,
  AnoxicZoneCondition: boolean
}

export interface OperationsDifferent {
  MaxDays: boolean, 
  operatingMonths: boolean,
  EnergyCostUnit: boolean
}

export interface CO2DataDifferent {
  totalEmissionOutputRate: boolean,
}

