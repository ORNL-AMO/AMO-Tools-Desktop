import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AeratorPerformanceData, WasteWaterData, ActivatedSludgeData } from '../../shared/models/waste-water';

@Injectable()
export class CompareService {

  wasteWaterDifferent: BehaviorSubject<WasteWaterDifferent>;
  constructor() {
    this.wasteWaterDifferent = new BehaviorSubject<WasteWaterDifferent>(undefined);
  }

  setWasteWaterDifferent(baselineData: WasteWaterData, modificationData?: WasteWaterData) {
    let wasteWaterDifferent: WasteWaterDifferent = this.compareBaselineModification(baselineData, modificationData);
    this.wasteWaterDifferent.next(wasteWaterDifferent);
  }

  compareBaselineModification(baselineData: WasteWaterData, modificationData?: WasteWaterData): WasteWaterDifferent {
    let activatedSludgeDifferent: ActivatedSludgeDifferent;
    let aeratorPerformanceDifferent: AeratorPerformanceDifferent;
    let isDifferent: boolean = false;
    if (modificationData) {
      activatedSludgeDifferent = this.compareActivatedSludge(baselineData.activatedSludgeData, modificationData.activatedSludgeData);
      aeratorPerformanceDifferent = this.compareAeratorPerformance(baselineData.aeratorPerformanceData, modificationData.aeratorPerformanceData);
      isDifferent = this.checkHasDifferent(activatedSludgeDifferent) || this.checkHasDifferent(aeratorPerformanceDifferent);
    } else {
      //compare baseline with baseline, all will come back false
      activatedSludgeDifferent = this.compareActivatedSludge(baselineData.activatedSludgeData, baselineData.activatedSludgeData);
      aeratorPerformanceDifferent = this.compareAeratorPerformance(baselineData.aeratorPerformanceData, baselineData.aeratorPerformanceData);
    }
    return {
      activatedSludgeDifferent: activatedSludgeDifferent,
      aeratorPerformanceDifferent: aeratorPerformanceDifferent,
      isDifferent: isDifferent
    }
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
      EnergyCostUnit: baselineData.EnergyCostUnit != modificationData.EnergyCostUnit,
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
  EnergyCostUnit: boolean,
  AnoxicZoneCondition: boolean
}

