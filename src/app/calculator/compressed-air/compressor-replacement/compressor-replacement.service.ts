import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';

/**
 * Display units follow the compressed-air assessment convention. CAGI data is Imperial
 * (acfm / psig / kW) and is converted to display units when a compressor is selected.
 */
export interface CompressorUnits {
  airflow: string; pressure: string; atmospheric: string;
  volume: string; distance: string; power: string; airVolume: string;
  costVolume: string;
}

/** m³/min per acfm */
const ACFM_TO_M3MIN: number = 0.0283168;
/** bar per psi */
const PSI_TO_BAR: number = 0.0689476;
/** kPa per psi */
const KPA_PER_PSI: number = 6.89476;
/** Sea-level atmospheric pressure (psia / kPaa) */
const SEA_LEVEL_PSIA: number = 14.7;
const SEA_LEVEL_KPAA: number = 101.325;
/** Polytropic exponent used by the pressure-inlet correction */
const POLY_EXPONENT: number = 1.395;
const HOURS_PER_YEAR: number = 8760;

export type CompressorLookupType = 'modelNumber' | 'capacityPressure' | 'manual';
export type PowerInputType = 'flAndZeroFlow' | 'averagePower';

/**
 * Baseline rows a modification row can link its average power to. The baseline atmospheric
 * pressure is carried along so each side of the pressure ratio uses its own site conditions.
 */
export interface AveragePowerLinkContext {
  sourceCompressors: Array<CompressorReplacementData>;
  sourceAtmosphericPressure: number;
}

/** Yellow (non-blocking) input warnings. A null entry means no warning. */
export interface CompressorReplacementWarnings {
  averageDutyFactor: string;
  totalOperatingHours: string;
  operatingPressure: string;
  zeroFlowPower: string;
  maxFullFlowPressure: string;
  unloadSumpPressure: string;
  noLoadPowerFM: string;
  numberOfStages: string;
}

/** Red errors for the scenario-level inputs. Any non-null entry stops that scenario's calculation. */
export interface ScenarioInputErrors {
  electricityCost: string;
  atmosphericPressure: string;
  totalAirStorage: string;
}

export interface ScenarioInputWarnings {
  atmosphericPressure: string;
}

export interface CompressorReplacementData {
  /** Stable id used for average-power links; survives renames and reordering. */
  compressorId?: string;
  /** Set on a modification row to derive its average power from a baseline row. */
  linkedCompressorId?: string;
  name: string;
  averageDutyFactor: number;
  totalOperatingHours: number;
  lookupType: CompressorLookupType;
  ratedCapacity: number;
  powerInputType: PowerInputType;
  fullLoadPower: number;
  zeroFlowPower: number;
  averagePower: number;
  // lookup / search state
  searchModelTerm?: string;
  capacityRequirement?: number;
  capacityRange?: number;
  pressureRequirement?: number;
  pressureRange?: number;
  vsdOnly?: boolean;
  includeWaterCooled?: boolean;
  oilFree?: boolean;
  brand?: string;
  selectedManufacturer?: string;
  selectedModelNumber?: string;
  // VSD capacity/power ladder; any rung may be blank
  maxCapacity?: number;
  capacity4?: number;
  capacity3?: number;
  capacity2?: number;
  capacity1?: number;
  minCapacity?: number;
  powerAtMaxCapacity?: number;
  powerAtCapacity4?: number;
  powerAtCapacity3?: number;
  powerAtCapacity2?: number;
  powerAtCapacity1?: number;
  powerAtMinCapacity?: number;
  // design details
  cagiType?: string;
  numberOfStages?: number;
  compressorOilFree?: boolean;
  fullLoadPressure?: number;
  maxFullFlowPressure?: number;
  /** Discharge pressure the compressor is evaluated at; blank means rated pressure. */
  operatingPressure?: number;
  controlType?: number;
  blowdownTime?: number;
  unloadSumpPressure?: number;
  unloadPointCapacity?: number;
  noLoadPowerFM?: number;
  color?: string;
  turndownRung?: string;
  midTurndownRung?: string;
  turndownCapacity?: number;
  turndownPower?: number;
  midTurndownCapacity?: number;
  midTurndownPower?: number;
  // computed
  electricityUse?: number;
  maxInputPower?: number;
  cubicFeet?: number;
  weightedDutyFactor?: number;
  cfm?: number;
  operatingHours?: number;
  annualCost?: number;
  costPerCF?: number;
}

export interface CompressorReplacementResult {
  totalOperatingHours: number;
  weightedDutyFactor: number;
  totalElectricityUse: number;
  totalMaxInputPower: number;
  totalAnnualCost: number;
  totalCubicFeet: number;
  totalCfm: number;
  costPerCF: number;
}

export interface CompressorReplacementResults {
  baselineResults: CompressorReplacementResult;
  modificationResults: CompressorReplacementResult;
  electricitySavings: number;
  maxInputPowerChange: number;
  electricityCostSavings: number;
  cubicFeetChange: number;
  cfmChange: number;
}

interface DutyPeriod { dutyFactor: number; hours: number; }
interface LadderPoint { capacity: number; power: number; }

@Injectable()
export class CompressorReplacementService {
  /** When false, laddered (VSD) compressors fall back to the fixed-speed blend. */
  haveUpdatedCagi: boolean = true;
  private compressorIdCounter: number = 0;

  baselineData: Array<CompressorReplacementData>;
  modificationData: Array<CompressorReplacementData>;
  baselineElectricityCost: number;
  modificationElectricityCost: number;
  baselineAtmosphericPressure: number;
  modificationAtmosphericPressure: number;
  baselineTotalAirStorage: number;
  modificationTotalAirStorage: number;
  operatingHours: OperatingHours;

  constructor(private fb: UntypedFormBuilder) { }

  isMetric(settings: Settings): boolean {
    return !!settings && settings.unitsOfMeasure === 'Metric';
  }

  getUnits(settings: Settings): CompressorUnits {
    if (this.isMetric(settings)) {
      return { airflow: 'm\u00B3/min', pressure: 'barg', atmospheric: 'kpaa', volume: 'm\u00B3', distance: 'm', power: 'kW', airVolume: 'million m\u00B3', costVolume: 'm\u00B3' };
    }
    return { airflow: 'acfm', pressure: 'psig', atmospheric: 'psia', volume: 'gal', distance: 'ft', power: 'kW', airVolume: 'MMCF', costVolume: 'ft\u00B3' };
  }

  /** Sea-level atmospheric pressure in display units (psia or kPaa). */
  getDefaultAtmosphericPressure(settings: Settings): number {
    return this.isMetric(settings) ? SEA_LEVEL_KPAA : SEA_LEVEL_PSIA;
  }

  /** CAGI CSV values are Imperial; convert to display units on selection. */
  convertCagiAirflow(value: number, settings: Settings): number {
    if (value === undefined || value === null || isNaN(value)) { return value; }
    return this.isMetric(settings) ? value * ACFM_TO_M3MIN : value;
  }

  convertCagiPressure(value: number, settings: Settings): number {
    if (value === undefined || value === null || isNaN(value)) { return value; }
    return this.isMetric(settings) ? value * PSI_TO_BAR : value;
  }

  /** Display units back to the CAGI sheet's acfm, for searching the dataset. */
  toCagiAirflow(value: number, settings: Settings): number {
    if (value === undefined || value === null || isNaN(value)) { return value; }
    return this.isMetric(settings) ? value / ACFM_TO_M3MIN : value;
  }

  /** Display units back to the CAGI sheet's psig (also used for pressure ranges). */
  toCagiPressure(value: number, settings: Settings): number {
    if (value === undefined || value === null || isNaN(value)) { return value; }
    return this.isMetric(settings) ? value / PSI_TO_BAR : value;
  }

  /** Imperial default rounded into display units, e.g. 15 psig -> 1.03 barg. */
  private displayDefault(imperialValue: number, metricFactor: number, settings: Settings): number {
    return this.isMetric(settings) ? Number((imperialValue * metricFactor).toFixed(2)) : imperialValue;
  }

  /** Names are editable and indices shift on delete, so links use this id instead. */
  createCompressorId(): string {
    this.compressorIdCounter++;
    return 'cr-' + Date.now().toString(36) + '-' + this.compressorIdCounter;
  }

  initObject(index: number, settings?: Settings): CompressorReplacementData {
    return {
      compressorId: this.createCompressorId(),
      linkedCompressorId: '',
      name: 'Compressor #' + (index + 1),
      averageDutyFactor: 0.85,
      totalOperatingHours: 8760,
      lookupType: 'manual',
      ratedCapacity: undefined,
      powerInputType: 'flAndZeroFlow',
      fullLoadPower: undefined,
      zeroFlowPower: undefined,
      averagePower: undefined,
      searchModelTerm: '',
      capacityRequirement: undefined,
      capacityRange: this.displayDefault(200, ACFM_TO_M3MIN, settings),
      pressureRequirement: this.displayDefault(125, PSI_TO_BAR, settings),
      pressureRange: this.displayDefault(10, PSI_TO_BAR, settings),
      vsdOnly: true,
      includeWaterCooled: false,
      oilFree: false,
      brand: '',
      selectedManufacturer: '',
      selectedModelNumber: '',
      maxCapacity: undefined,
      capacity4: undefined,
      capacity3: undefined,
      capacity2: undefined,
      capacity1: undefined,
      minCapacity: undefined,
      powerAtMaxCapacity: undefined,
      powerAtCapacity4: undefined,
      powerAtCapacity3: undefined,
      powerAtCapacity2: undefined,
      powerAtCapacity1: undefined,
      powerAtMinCapacity: undefined,
      cagiType: '',
      numberOfStages: undefined,
      compressorOilFree: false,
      fullLoadPressure: undefined,
      maxFullFlowPressure: undefined,
      operatingPressure: undefined,
      controlType: undefined,
      blowdownTime: undefined,
      unloadSumpPressure: this.displayDefault(15, PSI_TO_BAR, settings),
      unloadPointCapacity: 100,
      noLoadPowerFM: undefined,
      turndownRung: 'min',
      midTurndownRung: 'c3',
      turndownCapacity: undefined,
      turndownPower: undefined,
      midTurndownCapacity: undefined,
      midTurndownPower: undefined
    };
  }

  getFormFromObj(obj: CompressorReplacementData): UntypedFormGroup {
    return this.fb.group({
      compressorId: [obj.compressorId],
      linkedCompressorId: [obj.linkedCompressorId],
      name: [obj.name, Validators.required],
      averageDutyFactor: [obj.averageDutyFactor, [Validators.required, Validators.min(0)]],
      totalOperatingHours: [obj.totalOperatingHours, [Validators.required, Validators.min(0)]],
      lookupType: [obj.lookupType, Validators.required],
      ratedCapacity: [obj.ratedCapacity, [Validators.min(0)]],
      powerInputType: [obj.powerInputType, Validators.required],
      fullLoadPower: [obj.fullLoadPower, [Validators.min(0)]],
      zeroFlowPower: [obj.zeroFlowPower, [Validators.min(0)]],
      averagePower: [obj.averagePower, [Validators.min(0)]],
      searchModelTerm: [obj.searchModelTerm],
      capacityRequirement: [obj.capacityRequirement, [Validators.min(0)]],
      capacityRange: [obj.capacityRange, [Validators.min(0)]],
      pressureRequirement: [obj.pressureRequirement, [Validators.min(0)]],
      pressureRange: [obj.pressureRange, [Validators.min(0)]],
      vsdOnly: [obj.vsdOnly],
      includeWaterCooled: [obj.includeWaterCooled],
      oilFree: [obj.oilFree],
      brand: [obj.brand],
      selectedManufacturer: [obj.selectedManufacturer],
      selectedModelNumber: [obj.selectedModelNumber],
      maxCapacity: [obj.maxCapacity],
      capacity4: [obj.capacity4],
      capacity3: [obj.capacity3],
      capacity2: [obj.capacity2],
      capacity1: [obj.capacity1],
      minCapacity: [obj.minCapacity],
      powerAtMaxCapacity: [obj.powerAtMaxCapacity],
      powerAtCapacity4: [obj.powerAtCapacity4],
      powerAtCapacity3: [obj.powerAtCapacity3],
      powerAtCapacity2: [obj.powerAtCapacity2],
      powerAtCapacity1: [obj.powerAtCapacity1],
      powerAtMinCapacity: [obj.powerAtMinCapacity],
      cagiType: [obj.cagiType],
      numberOfStages: [obj.numberOfStages],
      compressorOilFree: [obj.compressorOilFree],
      fullLoadPressure: [obj.fullLoadPressure, [Validators.min(0)]],
      maxFullFlowPressure: [obj.maxFullFlowPressure, [Validators.min(0)]],
      operatingPressure: [obj.operatingPressure, [Validators.min(0)]],
      controlType: [obj.controlType],
      blowdownTime: [obj.blowdownTime, [Validators.min(0)]],
      unloadSumpPressure: [obj.unloadSumpPressure, [Validators.min(0)]],
      unloadPointCapacity: [obj.unloadPointCapacity, [Validators.min(0), Validators.max(100)]],
      noLoadPowerFM: [obj.noLoadPowerFM, [Validators.min(0)]],
      turndownRung: [obj.turndownRung],
      midTurndownRung: [obj.midTurndownRung],
      turndownCapacity: [obj.turndownCapacity, [Validators.min(0)]],
      turndownPower: [obj.turndownPower, [Validators.min(0)]],
      midTurndownCapacity: [obj.midTurndownCapacity, [Validators.min(0)]],
      midTurndownPower: [obj.midTurndownPower, [Validators.min(0)]]
    });
  }

  getObjFromForm(form: UntypedFormGroup): CompressorReplacementData {
    const c = form.controls;
    return {
      compressorId: c.compressorId.value,
      linkedCompressorId: c.linkedCompressorId.value,
      name: c.name.value,
      averageDutyFactor: c.averageDutyFactor.value,
      totalOperatingHours: c.totalOperatingHours.value,
      lookupType: c.lookupType.value,
      ratedCapacity: c.ratedCapacity.value,
      powerInputType: c.powerInputType.value,
      fullLoadPower: c.fullLoadPower.value,
      zeroFlowPower: c.zeroFlowPower.value,
      averagePower: c.averagePower.value,
      searchModelTerm: c.searchModelTerm.value,
      capacityRequirement: c.capacityRequirement.value,
      capacityRange: c.capacityRange.value,
      pressureRequirement: c.pressureRequirement.value,
      pressureRange: c.pressureRange.value,
      vsdOnly: c.vsdOnly.value,
      includeWaterCooled: c.includeWaterCooled.value,
      oilFree: c.oilFree.value,
      brand: c.brand.value,
      selectedManufacturer: c.selectedManufacturer.value,
      selectedModelNumber: c.selectedModelNumber.value,
      maxCapacity: c.maxCapacity.value,
      capacity4: c.capacity4.value,
      capacity3: c.capacity3.value,
      capacity2: c.capacity2.value,
      capacity1: c.capacity1.value,
      minCapacity: c.minCapacity.value,
      powerAtMaxCapacity: c.powerAtMaxCapacity.value,
      powerAtCapacity4: c.powerAtCapacity4.value,
      powerAtCapacity3: c.powerAtCapacity3.value,
      powerAtCapacity2: c.powerAtCapacity2.value,
      powerAtCapacity1: c.powerAtCapacity1.value,
      powerAtMinCapacity: c.powerAtMinCapacity.value,
      cagiType: c.cagiType.value,
      numberOfStages: c.numberOfStages.value,
      compressorOilFree: c.compressorOilFree.value,
      fullLoadPressure: c.fullLoadPressure.value,
      maxFullFlowPressure: c.maxFullFlowPressure.value,
      operatingPressure: c.operatingPressure.value,
      controlType: c.controlType.value,
      blowdownTime: c.blowdownTime.value,
      unloadSumpPressure: c.unloadSumpPressure.value,
      unloadPointCapacity: c.unloadPointCapacity.value,
      noLoadPowerFM: c.noLoadPowerFM.value,
      turndownRung: c.turndownRung.value,
      midTurndownRung: c.midTurndownRung.value,
      turndownCapacity: c.turndownCapacity.value,
      turndownPower: c.turndownPower.value,
      midTurndownCapacity: c.midTurndownCapacity.value,
      midTurndownPower: c.midTurndownPower.value
    };
  }

  /** Red errors come from the form validators. An invalid compressor is left out of the results. */
  isCompressorValid(data: CompressorReplacementData): boolean {
    const form: UntypedFormGroup = this.getFormFromObj(data);
    // A blank name is flagged on the form but doesn't affect the math.
    return Object.keys(form.controls).every(key => key === 'name' || form.controls[key].valid);
  }

  checkWarnings(data: CompressorReplacementData): CompressorReplacementWarnings {
    const fullLoadPower: number = this.num(data.fullLoadPower);
    const zeroFlowPower: number = this.num(data.zeroFlowPower);
    const fullLoadPressure: number = this.num(data.fullLoadPressure);
    const maxFullFlowPressure: number = this.num(data.maxFullFlowPressure);
    const unloadSumpPressure: number = this.num(data.unloadSumpPressure);
    const stages: number = this.num(data.numberOfStages);
    return {
      averageDutyFactor: this.num(data.averageDutyFactor) > 1 ? 'Duty factor is normally between 0 and 1' : null,
      totalOperatingHours: this.num(data.totalOperatingHours) > HOURS_PER_YEAR ? `Value is greater than the ${HOURS_PER_YEAR} hours in a year` : null,
      operatingPressure: this.checkOperatingPressureWarning(data),
      zeroFlowPower: (fullLoadPower > 0 && zeroFlowPower >= fullLoadPower) ? 'Zero-flow power is normally less than full-load power' : null,
      maxFullFlowPressure: (fullLoadPressure > 0 && maxFullFlowPressure > 0 && maxFullFlowPressure < fullLoadPressure)
        ? 'Maximum full flow pressure is normally at or above the full load operating pressure' : null,
      unloadSumpPressure: (fullLoadPressure > 0 && unloadSumpPressure >= fullLoadPressure)
        ? 'Unload sump pressure is normally below the full load operating pressure' : null,
      noLoadPowerFM: this.num(data.noLoadPowerFM) > 100 ? 'No load power is normally less than 100% of full load power' : null,
      numberOfStages: (!isNaN(stages) && stages !== 1 && stages !== 2) ? 'Only 1 and 2 stage compressors are modeled' : null
    };
  }

  private checkOperatingPressureWarning(data: CompressorReplacementData): string {
    const operatingPressure: number = this.num(data.operatingPressure);
    if (isNaN(operatingPressure)) { return null; }
    const maxFullFlowPressure: number = this.num(data.maxFullFlowPressure);
    if (maxFullFlowPressure > 0 && operatingPressure > maxFullFlowPressure) {
      return 'Operating pressure is above the maximum full flow pressure';
    }
    if (data.powerInputType === 'flAndZeroFlow' && !(this.num(data.fullLoadPressure) > 0)) {
      return 'Enter a full load operating pressure under Design Details to apply the pressure correction';
    }
    return null;
  }

  checkScenarioErrors(electricityCost: number, atmosphericPressure: number, totalAirStorage: number): ScenarioInputErrors {
    const cost: number = this.num(electricityCost);
    const atmospheric: number = this.num(atmosphericPressure);
    let atmosphericError: string = null;
    if (isNaN(atmospheric)) { atmosphericError = 'Value Required'; }
    else if (atmospheric <= 0) { atmosphericError = 'Value must be greater than 0'; }
    let costError: string = null;
    if (isNaN(cost)) { costError = 'Value Required'; }
    else if (cost < 0) { costError = 'Value can\'t be less than 0'; }
    return {
      electricityCost: costError,
      atmosphericPressure: atmosphericError,
      totalAirStorage: this.num(totalAirStorage) < 0 ? 'Value can\'t be less than 0' : null
    };
  }

  /** Yellow when atmospheric pressure is outside about 10 to 16 psia. */
  checkScenarioWarnings(atmosphericPressure: number, settings: Settings): ScenarioInputWarnings {
    const atmospheric: number = this.toImperialAtmospheric(atmosphericPressure, settings);
    const raw: number = this.num(atmosphericPressure);
    const outOfRange: boolean = raw > 0 && (atmospheric < 10 || atmospheric > 16);
    const range: string = this.isMetric(settings) ? '69 and 110 kPaa' : '10 and 16 psia';
    return { atmosphericPressure: outOfRange ? `Atmospheric pressure is normally between ${range}` : null };
  }

  isScenarioValid(electricityCost: number, atmosphericPressure: number): boolean {
    const errors: ScenarioInputErrors = this.checkScenarioErrors(electricityCost, atmosphericPressure, undefined);
    return errors.electricityCost === null && errors.atmosphericPressure === null;
  }

  /** Power draw (kW) at a given duty factor / percent speed. */
  powerAtDutyFactor(data: CompressorReplacementData, dutyFactor: number, atmosphericPressure?: number, settings?: Settings, linkContext?: AveragePowerLinkContext): number {
    if (data.powerInputType === 'averagePower') {
      return this.resolveAveragePower(data, atmosphericPressure, settings, linkContext);
    }
    // Only the load-side powers (full load, ladder) are pressure corrected; zero-flow is not.
    const factor: number = this.pressureCorrectionFactor(data, atmosphericPressure, settings);
    if (this.haveUpdatedCagi) {
      const ladder: Array<LadderPoint> = this.getLadderPoints(data, factor);
      if (ladder.length >= 2) {
        return this.interpolateVsdPower(data, ladder, dutyFactor);
      }
    }
    const fullLoad: number = (data.fullLoadPower || 0) * factor;
    const zeroFlow: number = data.zeroFlowPower || 0;
    return fullLoad * dutyFactor + zeroFlow * (1 - dutyFactor);
  }

  /**
   * Average power is entered at the operating pressure, so it is used as-is. A linked modification
   * row re-scales the baseline reading by the ratio of compression work between the two pressures.
   */
  resolveAveragePower(data: CompressorReplacementData, atmosphericPressure?: number, settings?: Settings, linkContext?: AveragePowerLinkContext): number {
    const source: CompressorReplacementData = this.findLinkSource(data, linkContext);
    if (!source) {
      return data.averagePower || 0;
    }
    const ratio: number = this.operatingPressureRatio(
      source.operatingPressure, linkContext.sourceAtmosphericPressure,
      data.operatingPressure, atmosphericPressure, settings);
    return (source.averagePower || 0) * ratio;
  }

  /** The linked baseline row, or undefined when there is no usable link. */
  findLinkSource(data: CompressorReplacementData, linkContext?: AveragePowerLinkContext): CompressorReplacementData {
    if (!data || !data.linkedCompressorId || !linkContext || !linkContext.sourceCompressors) { return undefined; }
    const source: CompressorReplacementData = linkContext.sourceCompressors
      .find(candidate => candidate.compressorId === data.linkedCompressorId);
    return this.isValidLinkSource(source) ? source : undefined;
  }

  /** A link target must be on average power with both a power and an operating pressure. */
  isValidLinkSource(candidate: CompressorReplacementData): boolean {
    return !!candidate
      && candidate.powerInputType === 'averagePower'
      && this.num(candidate.averagePower) > 0
      && this.num(candidate.operatingPressure) > 0;
  }

  /**
   * Ratio of compression work between two operating pressures (NREL UMP Ch.22 Eq.3 with the rated
   * term cancelled out). Returns 1 when either pressure is missing.
   *   ratio = (((P_to + P_atm,to)/P_atm,to)^k - 1) / (((P_from + P_atm,from)/P_atm,from)^k - 1)
   */
  operatingPressureRatio(fromGaugePressure: number, fromAtmosphericPressure: number,
                         toGaugePressure: number, toAtmosphericPressure: number, settings: Settings): number {
    const fromWork: number = this.compressionWork(fromGaugePressure, fromAtmosphericPressure, settings);
    const toWork: number = this.compressionWork(toGaugePressure, toAtmosphericPressure, settings);
    if (isNaN(fromWork) || isNaN(toWork) || fromWork <= 0) { return 1; }
    const ratio: number = toWork / fromWork;
    return isFinite(ratio) && ratio > 0 ? ratio : 1;
  }

  /** Pressure-ratio work term ((P_gauge + P_atm)/P_atm)^k - 1, in Imperial psia. NaN if unusable. */
  private compressionWork(gaugePressure: number, atmosphericPressure: number, settings: Settings): number {
    const gauge: number = this.toImperialGauge(gaugePressure, settings);
    const atmospheric: number = this.toImperialAtmospheric(atmosphericPressure, settings);
    if (isNaN(gauge) || gauge <= 0 || atmospheric <= 0) { return NaN; }
    const k: number = (POLY_EXPONENT - 1) / POLY_EXPONENT;
    return Math.pow((gauge + atmospheric) / atmospheric, k) - 1;
  }

  /** Display gauge pressure (psig / barg) to psig. */
  private toImperialGauge(value: unknown, settings: Settings): number {
    const gauge: number = this.num(value);
    if (isNaN(gauge)) { return NaN; }
    return this.isMetric(settings) ? gauge / PSI_TO_BAR : gauge;
  }

  /** Display atmospheric pressure (psia / kPaa) to psia, falling back to sea level when blank. */
  private toImperialAtmospheric(value: unknown, settings: Settings): number {
    let atmospheric: number = this.num(value);
    if (isNaN(atmospheric) || atmospheric <= 0) { atmospheric = this.getDefaultAtmosphericPressure(settings); }
    return this.isMetric(settings) ? atmospheric / KPA_PER_PSI : atmospheric;
  }

  /**
   * Pressure-inlet correction applied to full-load and ladder power.
   *   factor = (((P_op + P_alt)/P_alt)^k - 1) / (((P_rated + P_sea)/P_sea)^k - 1),  k = (poly - 1)/poly
   * NREL Uniform Methods Project, Ch.22 Compressed Air Evaluation Protocol, p.7 Eq.3; matches the
   * suite's PressureInletCorrection_PressRatio. Returns 1 when rated pressure is unknown.
   */
  pressureCorrectionFactor(data: CompressorReplacementData, atmosphericPressure: number, settings: Settings): number {
    const ratedGauge: number = this.num(data.fullLoadPressure);
    if (isNaN(ratedGauge) || ratedGauge <= 0) { return 1; }
    const opRaw: number = this.num(data.operatingPressure);
    const operatingGauge: number = isNaN(opRaw) ? ratedGauge : opRaw;
    const numerator: number = this.compressionWork(operatingGauge, atmosphericPressure, settings);
    // CAGI ratings are at sea level, so the rated term uses sea-level pressure rather than P_alt.
    const seaLevel: number = this.toImperialAtmospheric(this.getDefaultAtmosphericPressure(settings), settings);
    const pRated: number = this.toImperialGauge(ratedGauge, settings);
    const k: number = (POLY_EXPONENT - 1) / POLY_EXPONENT;
    const denominator: number = Math.pow((pRated + seaLevel) / seaLevel, k) - 1;
    if (isNaN(numerator) || denominator <= 0) { return 1; }
    const factor: number = numerator / denominator;
    return isFinite(factor) && factor > 0 ? factor : 1;
  }

  /** Valid (capacity, power) rungs, blank rungs dropped, sorted ascending by capacity. */
  private getLadderPoints(data: CompressorReplacementData, powerFactor: number = 1): Array<LadderPoint> {
    const pairs: Array<[number, number]> = [
      [data.maxCapacity, data.powerAtMaxCapacity],
      [data.capacity4, data.powerAtCapacity4],
      [data.capacity3, data.powerAtCapacity3],
      [data.capacity2, data.powerAtCapacity2],
      [data.capacity1, data.powerAtCapacity1],
      [data.minCapacity, data.powerAtMinCapacity]
    ];
    const points: Array<LadderPoint> = [];
    pairs.forEach(pair => {
      const capacity: number = this.num(pair[0]);
      const power: number = this.num(pair[1]);
      if (!isNaN(capacity) && !isNaN(power)) {
        points.push({ capacity: capacity, power: power * powerFactor });
      }
    });
    points.sort((a, b) => a.capacity - b.capacity);
    return points;
  }

  private interpolateVsdPower(data: CompressorReplacementData, ladder: Array<LadderPoint>, dutyFactor: number): number {
    const maxCapacity: number = !isNaN(this.num(data.maxCapacity)) ? this.num(data.maxCapacity) : (data.ratedCapacity || 0);
    const actualCapacity: number = dutyFactor * maxCapacity;
    const zeroFlow: number = data.zeroFlowPower || 0;
    const lowest: LadderPoint = ladder[0];
    const highest: LadderPoint = ladder[ladder.length - 1];

    if (actualCapacity >= highest.capacity) {
      return highest.power;
    }
    if (actualCapacity <= lowest.capacity) {
      // Below the lowest rung the unit load/unloads between that rung and zero flow.
      const dfPrime: number = lowest.capacity > 0 ? actualCapacity / lowest.capacity : 0;
      return lowest.power * dfPrime + zeroFlow * (1 - dfPrime);
    }
    for (let i = 0; i < ladder.length - 1; i++) {
      const lo: LadderPoint = ladder[i];
      const hi: LadderPoint = ladder[i + 1];
      if (actualCapacity >= lo.capacity && actualCapacity <= hi.capacity) {
        const span: number = hi.capacity - lo.capacity;
        if (span === 0) { return lo.power; }
        const t: number = (actualCapacity - lo.capacity) / span;
        return lo.power + t * (hi.power - lo.power);
      }
    }
    return highest.power;
  }

  private num(value: unknown): number {
    if (value === null || value === undefined || value === '') { return NaN; }
    const n: number = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(n) ? n : NaN;
  }

  private getPeriods(data: CompressorReplacementData): Array<DutyPeriod> {
    return [{ dutyFactor: data.averageDutyFactor || 0, hours: data.totalOperatingHours || 0 }];
  }

  getResultData(data: CompressorReplacementData, electricityCost: number, atmosphericPressure?: number, settings?: Settings, linkContext?: AveragePowerLinkContext): CompressorReplacementData {
    if (!this.isCompressorValid(data)) { return this.getEmptyResultData(data); }
    const result: CompressorReplacementData = { ...data };
    const periods: Array<DutyPeriod> = this.getPeriods(data);
    const ratedCapacity: number = data.ratedCapacity || 0;
    let electricityUse: number = 0;
    let cubicFeet: number = 0;
    let totalHours: number = 0;
    let dutyHourProduct: number = 0;
    periods.forEach(period => {
      electricityUse += this.powerAtDutyFactor(data, period.dutyFactor, atmosphericPressure, settings, linkContext) * period.hours;
      cubicFeet += ratedCapacity * 60 * period.hours * period.dutyFactor;
      totalHours += period.hours;
      dutyHourProduct += period.dutyFactor * period.hours;
    });
    // Power at 100% duty factor, reported instead of billed demand so no utility demand rules are assumed.
    const maxInputPower: number = this.powerAtDutyFactor(data, 1, atmosphericPressure, settings, linkContext);
    const annualCost: number = electricityUse * (electricityCost || 0);
    result.electricityUse = electricityUse;
    result.maxInputPower = maxInputPower;
    result.cubicFeet = cubicFeet;
    result.operatingHours = totalHours;
    result.weightedDutyFactor = totalHours > 0 ? dutyHourProduct / totalHours : 0;
    result.cfm = ratedCapacity * result.weightedDutyFactor;
    result.annualCost = annualCost;
    result.costPerCF = cubicFeet > 0 ? annualCost / cubicFeet : 0;
    return result;
  }

  getEmptyResultData(data: CompressorReplacementData): CompressorReplacementData {
    return {
      ...data,
      electricityUse: 0, maxInputPower: 0, cubicFeet: 0, operatingHours: 0,
      weightedDutyFactor: 0, cfm: 0, annualCost: 0, costPerCF: 0
    };
  }

  getTotals(dataArray: Array<CompressorReplacementData>, electricityCost: number, atmosphericPressure: number, settings: Settings, linkContext?: AveragePowerLinkContext): { result: CompressorReplacementResult, rows: Array<CompressorReplacementData> } {
    const scenarioValid: boolean = this.isScenarioValid(electricityCost, atmosphericPressure);
    const rows: Array<CompressorReplacementData> = (dataArray || []).map(data => scenarioValid
      ? this.getResultData(data, electricityCost, atmosphericPressure, settings, linkContext)
      : this.getEmptyResultData(data));
    const totalOperatingHours: number = _.sumBy(rows, 'operatingHours');
    const totalElectricityUse: number = _.sumBy(rows, 'electricityUse');
    const totalMaxInputPower: number = _.sumBy(rows, 'maxInputPower');
    const totalAnnualCost: number = _.sumBy(rows, 'annualCost');
    const totalCubicFeet: number = _.sumBy(rows, 'cubicFeet');
    const totalCfm: number = _.sumBy(rows, 'cfm');
    const dutyHourProduct: number = _.sumBy(rows, row => (row.weightedDutyFactor || 0) * (row.operatingHours || 0));
    const result: CompressorReplacementResult = {
      totalOperatingHours, weightedDutyFactor: totalOperatingHours > 0 ? dutyHourProduct / totalOperatingHours : 0,
      totalElectricityUse, totalMaxInputPower, totalAnnualCost, totalCubicFeet, totalCfm,
      costPerCF: totalCubicFeet > 0 ? totalAnnualCost / totalCubicFeet : 0
    };
    return { result, rows };
  }

  getResults(baseline: Array<CompressorReplacementData>, modifications: Array<CompressorReplacementData>, baselineElectricityCost: number, modificationElectricityCost: number, baselineAtmosphericPressure: number, modificationAtmosphericPressure: number, settings: Settings): { results: CompressorReplacementResults, baselineRows: Array<CompressorReplacementData>, modificationRows: Array<CompressorReplacementData> } {
    const baselineTotals = this.getTotals(baseline, baselineElectricityCost, baselineAtmosphericPressure, settings);
    // Only modification rows link, and always to the baseline scenario.
    const linkContext: AveragePowerLinkContext = {
      sourceCompressors: baseline || [],
      sourceAtmosphericPressure: baselineAtmosphericPressure
    };
    const modificationTotals = this.getTotals(modifications || [], modificationElectricityCost, modificationAtmosphericPressure, settings, linkContext);
    const results: CompressorReplacementResults = {
      baselineResults: baselineTotals.result,
      modificationResults: modificationTotals.result,
      electricitySavings: baselineTotals.result.totalElectricityUse - modificationTotals.result.totalElectricityUse,
      maxInputPowerChange: baselineTotals.result.totalMaxInputPower - modificationTotals.result.totalMaxInputPower,
      electricityCostSavings: baselineTotals.result.totalAnnualCost - modificationTotals.result.totalAnnualCost,
      cubicFeetChange: baselineTotals.result.totalCubicFeet - modificationTotals.result.totalCubicFeet,
      cfmChange: baselineTotals.result.totalCfm - modificationTotals.result.totalCfm
    };
    return { results, baselineRows: baselineTotals.rows, modificationRows: modificationTotals.rows };
  }

  generateExample(settings?: Settings): CompressorReplacementData {
    const example: CompressorReplacementData = this.initObject(0, settings);
    example.ratedCapacity = this.displayDefault(1050, ACFM_TO_M3MIN, settings);
    example.fullLoadPower = 200;
    example.zeroFlowPower = 60;
    example.averageDutyFactor = 0.85;
    example.totalOperatingHours = 8760;
    return example;
  }
}
