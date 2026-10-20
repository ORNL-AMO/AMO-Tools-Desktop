import { Injectable } from '@angular/core';
import { CompressorReplacementData } from './compressor-replacement.service';
import { CompressorInventoryItem, PerformancePoint, CentrifugalSpecifics } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';

/** MEASUR control-type enum values (from ControlTypes). */
export const CONTROL_LOAD_UNLOAD = 4;
export const CONTROL_VFD = 11;
/** Default unload sump pressure, psig (1.03 barg) */
const DEFAULT_SUMP_PSIG: number = 15;
const PSI_TO_BAR: number = 0.0689476;

/**
 * Builds a CompressorInventoryItem from a compressor row so compressorsCalc() can draw its
 * performance curve. Centrifugal (type 6) is not supported yet.
 */
@Injectable()
export class CompressorAdapterService {

  /** Skipped on the plot: average power rows, centrifugal, or no usable power data. */
  isDeferred(data: CompressorReplacementData): boolean {
    return data.powerInputType === 'averagePower'
      || this.mapCompressorType(data) === 6
      || !(data.fullLoadPower > 0 || this.getLadder(data).length >= 2);
  }

  /**
   * Every reason this compressor can't be drawn, as sentence fragments. Follows the assessment's
   * inventory validators for the points each control type uses.
   */
  getProfileBlockers(data: CompressorReplacementData, totalAirStorage?: number): Array<string> {
    const blockers: Array<string> = [];
    if (!data) { return blockers; }

    if (data.powerInputType === 'averagePower') {
      return ['power was entered as a single average value, which describes one operating point rather than a part-load curve'];
    }
    const compressorType: number = this.mapCompressorType(data);
    if (compressorType === 6) {
      return ['centrifugal compressors are not yet supported on this graph'];
    }

    const controlType: number = (data.controlType !== undefined && data.controlType !== null && String(data.controlType) !== '')
      ? Number(data.controlType) : this.defaultControlType(data);
    const ratedCapacity: number = this.num(data.ratedCapacity);
    const fullLoadPower: number = this.num(data.fullLoadPower);
    const zeroFlowPower: number = this.num(data.zeroFlowPower);
    const fullLoadPressure: number = this.num(data.fullLoadPressure);
    const maxFullFlowPressure: number = this.num(data.maxFullFlowPressure);

    // --- required for every control type ---
    if (isNaN(ratedCapacity) || ratedCapacity <= 0) { blockers.push('no rated capacity'); }
    if (isNaN(fullLoadPower) || fullLoadPower <= 0) { blockers.push('no full-load power'); }
    if (isNaN(fullLoadPressure) || fullLoadPressure <= 0) { blockers.push('no full-load operating pressure'); }

    // --- zero-flow (no-load) power ---
    // Zero is allowed here (the suite handles it), so only a blank field blocks the graph.
    if (controlType === 6) {
      // Start/stop shuts off between cycles; blank is taken as 0.
      if (!isNaN(zeroFlowPower) && zeroFlowPower !== 0) {
        blockers.push('zero-flow power must be 0 for start/stop control');
      }
    } else if (isNaN(zeroFlowPower)) {
      blockers.push('no zero-flow power');
    } else if (!isNaN(fullLoadPower) && fullLoadPower > 0 && zeroFlowPower >= fullLoadPower) {
      blockers.push('zero-flow power must be less than full-load power');
    }

    // --- maximum full-flow pressure ---
    if (this.requiresMaxFullFlow(compressorType, controlType)) {
      // Load/unload, multi-step and start/stop need a pressure band; modulating controls just can't run backwards.
      const mustExceedFullLoad: boolean = (controlType === 4 || controlType === 5 || controlType === 6);
      const isMissing: boolean = isNaN(maxFullFlowPressure) || maxFullFlowPressure <= 0;
      if (isMissing) { blockers.push('no maximum full-flow pressure'); }
      if (!isNaN(fullLoadPressure) && fullLoadPressure > 0) {
        if (mustExceedFullLoad && (isMissing || maxFullFlowPressure <= fullLoadPressure)) {
          blockers.push('maximum full-flow pressure must be greater than full-load operating pressure');
        } else if (!mustExceedFullLoad && !isMissing && maxFullFlowPressure < fullLoadPressure) {
          blockers.push('maximum full-flow pressure cannot be less than full-load operating pressure');
        }
      }
    }

    // --- modulation with unloading (2) and variable displacement (3) ---
    if (controlType === 2 || controlType === 3) {
      const unloadPointCapacity: number = this.num(data.unloadPointCapacity);
      if (!isNaN(maxFullFlowPressure) && !isNaN(fullLoadPressure) && maxFullFlowPressure <= fullLoadPressure) {
        blockers.push('the modulating pressure range is zero, so there is nothing to modulate across');
      }
      if (controlType === 2 && !isNaN(unloadPointCapacity) && unloadPointCapacity >= 100) {
        blockers.push('unload point capacity must be less than 100% for inlet modulation with unloading');
      }
      if (isNaN(this.num(data.noLoadPowerFM)) && (isNaN(zeroFlowPower) || isNaN(fullLoadPower) || fullLoadPower <= 0)) {
        blockers.push('no no-load power as a percent of full load');
      }
    }

    // --- VFD turndown points (control 11) ---
    if (controlType === CONTROL_VFD) {
      const ladder: Array<{ capacity: number, power: number }> = this.getLadder(data);
      const turndown: PerformancePoint = this.turndownPointFor(data, ladder, data.turndownCapacity, data.turndownPower, data.turndownRung || 'min', fullLoadPressure, 1);
      const midTurndown: PerformancePoint = this.turndownPointFor(data, ladder, data.midTurndownCapacity, data.midTurndownPower, data.midTurndownRung || 'c3', fullLoadPressure, 1);
      if (!(turndown.airflow > 0) || !(turndown.power > 0)) {
        blockers.push('no turndown capacity and input power');
      }
      if (!(midTurndown.airflow > 0) || !(midTurndown.power > 0)) {
        blockers.push('no mid-turndown capacity and input power');
      }
      if (turndown.airflow > 0 && midTurndown.airflow > 0 && turndown.airflow >= midTurndown.airflow) {
        blockers.push('turndown capacity must be less than mid-turndown capacity');
      }
      if (turndown.power > 0 && midTurndown.power > 0 && turndown.power >= midTurndown.power) {
        blockers.push('turndown input power must be less than mid-turndown input power');
      }
      if (midTurndown.airflow > 0 && !isNaN(ratedCapacity) && midTurndown.airflow >= ratedCapacity) {
        blockers.push('mid-turndown capacity must be less than rated capacity');
      }
    }

    // --- receiver storage, used by the controls that unload into a receiver ---
    if (controlType === 2 || controlType === 3 || controlType === 4 || controlType === 5) {
      if (!(this.num(totalAirStorage) > 0)) {
        blockers.push('no total air storage');
      }
    }

    return blockers;
  }

  /** Mirrors CompressorInventoryItemClass.setShowMaxFullFlow. */
  private requiresMaxFullFlow(compressorType: number, controlType: number): boolean {
    if ((compressorType === 1 || compressorType === 2) && controlType === 1) { return false; }
    return controlType !== CONTROL_VFD;
  }

  /** Uncorrected rated full-load power (kW), or the top ladder rung when full load is blank. */
  ratedFullLoadPower(data: CompressorReplacementData): number {
    const nameplate: number = this.num(data.fullLoadPower);
    if (!isNaN(nameplate) && nameplate > 0) { return nameplate; }
    const ladder: Array<{ capacity: number, power: number }> = this.getLadder(data);
    return ladder.length > 0 ? ladder[ladder.length - 1].power : 0;
  }

  /** Rated capacity (display units), or the top ladder rung when rated capacity is blank. */
  ratedCapacity(data: CompressorReplacementData): number {
    const nameplate: number = this.num(data.ratedCapacity);
    if (!isNaN(nameplate) && nameplate > 0) { return nameplate; }
    const ladder: Array<{ capacity: number, power: number }> = this.getLadder(data);
    return ladder.length > 0 ? ladder[ladder.length - 1].capacity : 0;
  }

  /**
   * @param pressureFactor inlet-pressure correction (1 = none), applied to load-side power only.
   * Zero-flow power is left uncorrected, same as the energy calculation.
   */
  buildInventoryItem(data: CompressorReplacementData, pressureFactor: number = 1, settings?: Settings): CompressorInventoryItem {
    const compressorType: number = this.mapCompressorType(data);
    const controlType: number = (data.controlType !== undefined && data.controlType !== null)
      ? data.controlType : this.defaultControlType(data);

    const factor: number = (isFinite(pressureFactor) && pressureFactor > 0) ? pressureFactor : 1;
    const ratedCapacity: number = data.ratedCapacity || 0;
    const fullLoadPower: number = (data.fullLoadPower || 0) * factor;
    const zeroFlowPower: number = data.zeroFlowPower || 0;
    const fullLoadPressure: number = data.fullLoadPressure || 0;
    const maxFullFlowPressure: number = data.maxFullFlowPressure || fullLoadPressure;
    const defaultSump: number = settings?.unitsOfMeasure === 'Metric' ? Number((DEFAULT_SUMP_PSIG * PSI_TO_BAR).toFixed(2)) : DEFAULT_SUMP_PSIG;
    const sump: number = (data.unloadSumpPressure !== undefined && data.unloadSumpPressure !== null) ? data.unloadSumpPressure : defaultSump;
    const oilFree: boolean = !!data.compressorOilFree;
    // Default taken against the corrected full load so the unloaded floor stays at its real kW.
    const noLoadPowerFM: number = (data.noLoadPowerFM !== undefined && data.noLoadPowerFM !== null)
      ? data.noLoadPowerFM : (fullLoadPower > 0 ? (zeroFlowPower / fullLoadPower) * 100 : 0);
    const ladder = this.getLadder(data);

    return {
      itemId: 'cr-' + (data.selectedModelNumber || data.name || 'adapter'),
      name: data.name,
      description: '',
      color: data.color || '#1f77b4',
      nameplateData: {
        compressorType: compressorType,
        motorPower: 0,
        fullLoadOperatingPressure: fullLoadPressure,
        fullLoadRatedCapacity: ratedCapacity,
        ratedLoadPower: fullLoadPower,
        ploytropicCompressorExponent: 1.4,
        fullLoadAmps: 0,
        totalPackageInputPower: fullLoadPower
      },
      compressorControls: {
        controlType: controlType,
        unloadPointCapacity: (data.unloadPointCapacity !== undefined && data.unloadPointCapacity !== null) ? data.unloadPointCapacity : 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: false,
        unloadSumpPressure: sump
      },
      designDetails: {
        blowdownTime: (data.blowdownTime !== undefined && data.blowdownTime !== null) ? data.blowdownTime : (oilFree ? 0.0003 : 40),
        modulatingPressureRange: Math.max(0, maxFullFlowPressure - fullLoadPressure),
        inputPressure: 0,
        designEfficiency: 100,
        serviceFactor: 1,
        noLoadPowerFM: noLoadPowerFM,
        noLoadPowerUL: 0,
        maxFullFlowPressure: maxFullFlowPressure
      },
      performancePoints: {
        fullLoad: this.pp(ratedCapacity, fullLoadPower, fullLoadPressure),
        noLoad: this.pp(0, zeroFlowPower, sump),
        maxFullFlow: this.pp(ratedCapacity, fullLoadPower, maxFullFlowPressure),
        unloadPoint: this.buildUnloadPoint(controlType, ratedCapacity, fullLoadPower, maxFullFlowPressure, fullLoadPressure, noLoadPowerFM, data),
        blowoff: this.pp(0, 0, 0),
        turndown: controlType === CONTROL_VFD ? this.turndownPointFor(data, ladder, data.turndownCapacity, data.turndownPower, data.turndownRung || 'min', fullLoadPressure, factor) : undefined,
        midTurndown: controlType === CONTROL_VFD ? this.turndownPointFor(data, ladder, data.midTurndownCapacity, data.midTurndownPower, data.midTurndownRung || 'c3', fullLoadPressure, factor) : undefined
      },
      centrifugalSpecifics: this.emptyCentrifugal(),
      modifiedDate: new Date()
    };
  }

  private mapCompressorType(data: CompressorReplacementData): number {
    const type: string = (data.cagiType || '').toLowerCase();
    const stages: number = (data.numberOfStages && data.numberOfStages >= 2) ? 2 : 1; // missing => 1
    if (type.indexOf('centrif') >= 0) { return 6; }
    if (type.indexOf('recip') >= 0) { return stages === 2 ? 5 : 4; }
    // rotary screw (default); oil-free is type 3 for either stage count
    if (data.compressorOilFree) { return 3; }
    return stages === 2 ? 2 : 1;
  }

  /** VFD when a ladder is present (2+ rungs), otherwise load/unload. */
  private defaultControlType(data: CompressorReplacementData): number {
    return this.getLadder(data).length >= 2 ? CONTROL_VFD : CONTROL_LOAD_UNLOAD;
  }

  private getLadder(data: CompressorReplacementData): Array<{ capacity: number, power: number }> {
    const pairs: Array<[number, number]> = [
      [data.maxCapacity, data.powerAtMaxCapacity], [data.capacity4, data.powerAtCapacity4],
      [data.capacity3, data.powerAtCapacity3], [data.capacity2, data.powerAtCapacity2],
      [data.capacity1, data.powerAtCapacity1], [data.minCapacity, data.powerAtMinCapacity]
    ];
    const pts: Array<{ capacity: number, power: number }> = [];
    pairs.forEach(pair => {
      const cap: number = this.num(pair[0]);
      const pow: number = this.num(pair[1]);
      if (!isNaN(cap) && !isNaN(pow)) { pts.push({ capacity: cap, power: pow }); }
    });
    pts.sort((a, b) => a.capacity - b.capacity);
    return pts;
  }

  /**
   * Unload point for modulation-with-unloading controls (inlet modulation = 2, variable
   * displacement = 3). Mirrors the suite's Compressors_ModulationWithUnload:
   *   C_ul  = C_fl * unloadPointCapacity/100
   *   kW_ul = (kW_fl - noLoadPowerFM*kW_fl) * (C_ul/C_fl)^modExp + noLoadPowerFM*kW_fl
   *   P_ul  = P_max + (1 - C_ul/C_fl) * modulatingPressureRange
   * modExp = 1 for inlet modulation (2), 2 for variable displacement (3).
   * Other control types get an empty point.
   */
  private buildUnloadPoint(controlType: number, ratedCapacity: number, fullLoadPower: number,
                           maxFullFlowPressure: number, fullLoadPressure: number,
                           noLoadPowerFMPercent: number, data: CompressorReplacementData): PerformancePoint {
    if (controlType !== 2 && controlType !== 3) { return this.pp(0, 0, 0); }
    const upcRaw: number = this.num(data.unloadPointCapacity);
    const upc: number = isNaN(upcRaw) ? 100 : upcRaw;
    const fraction: number = upc / 100;
    const nlFrac: number = (noLoadPowerFMPercent || 0) / 100;
    const modExp: number = controlType === 3 ? 2 : 1;
    const capacity: number = ratedCapacity * fraction;
    const kwMaxMod: number = nlFrac * fullLoadPower;
    const power: number = (fullLoadPower - kwMaxMod) * Math.pow(fraction, modExp) + kwMaxMod;
    const modRange: number = Math.max(0, maxFullFlowPressure - (fullLoadPressure || 0));
    const pressure: number = maxFullFlowPressure + (1 - fraction) * modRange;
    return this.pp(capacity, power, pressure);
  }

  /**
   * Turndown point from the entered capacity/power, else the selected ladder rung. These are
   * load-side points, so they get the same pressure correction as full load.
   */
  private turndownPointFor(data: CompressorReplacementData, ladder: Array<{ capacity: number, power: number }>,
                           capVal: number, powVal: number, rung: string, pressure: number, factor: number): PerformancePoint {
    const cap: number = this.num(capVal);
    const pow: number = this.num(powVal);
    if (!isNaN(cap) && !isNaN(pow)) { return this.pp(cap, pow * factor, pressure); }
    return this.rungPoint(data, ladder, rung, pressure, factor);
  }

  /** Performance point for a named ladder rung; falls back to nearest present rung. */
  private rungPoint(data: CompressorReplacementData, ladder: Array<{ capacity: number, power: number }>,
                    rung: string, pressure: number, factor: number): PerformancePoint {
    const map: { [key: string]: Array<number> } = {
      max: [data.maxCapacity, data.powerAtMaxCapacity],
      c4: [data.capacity4, data.powerAtCapacity4],
      c3: [data.capacity3, data.powerAtCapacity3],
      c2: [data.capacity2, data.powerAtCapacity2],
      c1: [data.capacity1, data.powerAtCapacity1],
      min: [data.minCapacity, data.powerAtMinCapacity]
    };
    const pair: Array<number> = map[rung];
    if (pair && !isNaN(this.num(pair[0])) && !isNaN(this.num(pair[1]))) {
      return this.pp(this.num(pair[0]), this.num(pair[1]) * factor, pressure);
    }
    if (ladder.length === 0) { return this.pp(0, 0, pressure); }
    const fallback = (rung === 'min' || rung === 'c1') ? ladder[0] : ladder[Math.floor(ladder.length / 2)];
    return this.pp(fallback.capacity, fallback.power * factor, pressure);
  }

  private pp(airflow: number, power: number, dischargePressure: number): PerformancePoint {
    return {
      airflow: airflow, power: power, dischargePressure: dischargePressure,
      isDefaultAirFlow: false, isDefaultPower: false, isDefaultPressure: false
    };
  }

  private emptyCentrifugal(): CentrifugalSpecifics {
    return { surgeAirflow: 0, maxFullLoadPressure: 0, maxFullLoadCapacity: 0, minFullLoadPressure: 0, minFullLoadCapacity: 0 };
  }

  private num(value: unknown): number {
    if (value === null || value === undefined || value === '') { return NaN; }
    const n: number = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(n) ? n : NaN;
  }
}
