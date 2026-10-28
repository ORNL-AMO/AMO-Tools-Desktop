import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../../electron/electron.service';
import { MotorCatalogService } from '../../motor-inventory/motor-inventory-setup/motor-catalog/motor-catalog.service';
import { LoadCharacteristicDataComponent } from '../../motor-inventory/motor-inventory-setup/motor-catalog/load-characteristic-data/load-characteristic-data.component';
import { LoadCharacteristicDataService } from '../../motor-inventory/motor-inventory-setup/motor-catalog/load-characteristic-data/load-characteristic-data.service';
import { OperationsDataComponent } from '../../motor-inventory/motor-inventory-setup/motor-catalog/operations-data/operations-data.component';
import { OperationsDataService } from '../../motor-inventory/motor-inventory-setup/motor-catalog/operations-data/operations-data.service';
import { MotorItem, MotorInventoryData } from '../../motor-inventory/motor-inventory';
import { MotorInventoryService } from '../../motor-inventory/motor-inventory.service';
import { PsatService } from '../../psat/psat.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FsatInput } from '../../shared/models/fans';
import { PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { FansSuiteApiService } from '../fans-suite-api.service';
import { PumpsSuiteApiService } from '../pumps-suite-api.service';
import { SuiteApiHelperService } from '../suite-api-helper.service';
import { ToolsSuiteApiService } from '../tools-suite-api.service';

export interface ScenarioResult {
  id: string;
  inputs: unknown;
  units: string;
  result: unknown;
}

/** Preserve undefined, nonfinite values and signed zero rather than losing them in JSON. */
export function canonical(value: unknown): unknown {
  if (value === undefined) return { $value: 'undefined' };
  if (typeof value === 'number' && (!Number.isFinite(value) || Object.is(value, -0))) {
    return { $number: Object.is(value, -0) ? '-0' : String(value) };
  }
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

export async function initializeMotorDrivenServices() {
  const tools = new ToolsSuiteApiService(null, null, null, null, null, null, null, null,
    { isElectron: false } as ElectronService);
  await tools.initializeModule();
  const helper = new SuiteApiHelperService(tools);
  const pumps = new PumpsSuiteApiService(helper, tools);
  const fans = new FansSuiteApiService(helper, tools);
  const convert = new ConvertUnitsService();
  const psat = new PsatService(pumps, convert, null, null, null, null);
  return { tools, pumps, fans, psat, convert };
}

export type MotorDrivenServices = Awaited<ReturnType<typeof initializeMotorDrivenServices>>;

export function pumpInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    pump_style: 6, pump_specified: 80, pump_rated_speed: 1780, drive: 0,
    specifiedDriveEfficiency: 95, differentialPressure: 0, kinematic_viscosity: 1,
    specific_gravity: 1, stages: 2, fixed_speed: 1, line_frequency: 60,
    motor_rated_power: 200, motor_rated_speed: 1780, efficiency_class: 3, efficiency: 95,
    motor_rated_voltage: 460, load_estimation_method: 0, motor_rated_fla: 225, margin: 0,
    operating_hours: 8760, flow_rate: 1840, head: 174.85, motor_field_power: 80,
    motor_field_current: 125.857, motor_field_voltage: 480, cost_kw_hour: 0.05,
    fluidType: 'Water', fluidTemperature: 68, ...overrides,
  };
}

function fanInputs(overrides: Partial<FsatInput> = {}): FsatInput {
  return {
    fanSpeed: 1180, drive: 0, specifiedDriveEfficiency: 95, lineFrequency: 60,
    motorRatedPower: 600, motorRpm: 1180, efficiencyClass: 1, specifiedEfficiency: 95,
    motorRatedVoltage: 460, fullLoadAmps: 683.2505707137, sizeMargin: 1,
    measuredPower: 460, measuredVoltage: 460, measuredAmps: 660, flowRate: 129691,
    inletPressure: -16.36, outletPressure: 1.1, compressibilityFactor: 0.988,
    loadEstimationMethod: 0, operatingHours: 8760, unitCost: 0.06, airDensity: 1.02,
    velocityPressure: 0, fanEfficiency: 80, ...overrides,
  };
}

export const imperial: Settings = {
  unitsOfMeasure: 'Imperial', powerMeasurement: 'hp', distanceMeasurement: 'ft',
  flowMeasurement: 'gpm', temperatureMeasurement: 'F', currency: '$',
};
export const metric: Settings = { ...imperial, unitsOfMeasure: 'Metric', powerMeasurement: 'kW' };

/** Exercise production adapters, conversion/rounding and inventory actions; no engineering formula is duplicated. */
export function captureScenarios(services: MotorDrivenServices): ScenarioResult[] {
  const { pumps, fans, psat, convert } = services;
  const scenarios: ScenarioResult[] = [];
  const capture = (id: string, inputs: unknown, units: string, run: () => unknown) => {
    let result: unknown;
    try { result = run(); }
    catch (error) { result = { error: error instanceof Error ? error.name : 'Error', message: String(error) }; }
    scenarios.push({ id, inputs: canonical(inputs), units, result: canonical(result) });
  };
  for (const style of [6, 12]) {
    for (const drive of [0, 1, 4]) {
      for (const method of [0, 1]) {
        const input = pumpInputs({ pump_style: style, drive, load_estimation_method: method,
          ...(style === 12 ? { flow_rate: 100, head: 999, differentialPressure: 50 } : {}) });
        capture(`pump-existing-${style}-${drive}-${method}`, input,
          'hp, electrical kW, A, efficiencies/PF in %, load fraction, MWh/year, $/year', () => {
            const raw = pumps.resultsExisting(structuredClone(input));
            return { raw, displayed: psat.roundResults({ ...raw, co2EmissionsOutput: 0 }) };
          });
      }
      const input = pumpInputs({ pump_style: style, drive,
        ...(style === 12 ? { flow_rate: 100, head: 999, differentialPressure: 50 } : {}) });
      capture(`pump-modified-${style}-${drive}`, input,
        'hp, electrical kW, A, efficiencies/PF in %, load fraction, MWh/year, $/year', () => {
          const raw = pumps.resultsModified(structuredClone(input));
          return { raw, displayed: psat.roundResults({ ...raw, co2EmissionsOutput: 0 }) };
        });
    }
  }
  capture('pump-metric-output', { input: pumpInputs(), settings: metric }, 'shaft/rated power kW; MWh/year; $/year', () => {
    const raw = psat.convertOutputs(pumps.resultsExisting(pumpInputs()), metric);
    return { raw, displayed: psat.roundResults({ ...raw, co2EmissionsOutput: 0 }) };
  });
  for (const drive of [0, 1, 4]) {
    for (const method of [0, 1]) {
      const input = fanInputs({ drive, loadEstimationMethod: method });
      capture(`fan-existing-${drive}-${method}`, input, 'shaft hp; electrical kW; A; %; MWh/year; $/year',
        () => fans.calculateExisting(structuredClone(input)));
    }
    const input = fanInputs({ drive });
    capture(`fan-modified-${drive}`, input, 'shaft hp; electrical kW; A; %; MWh/year; $/year',
      () => fans.calculateModified(structuredClone(input)));
  }
  for (const efficiencyClass of [0, 1, 2, 3]) {
    capture(`fla-${efficiencyClass}`, { hp: 200, rpm: 1780, hz: 60, efficiencyClass, efficiencyPercent: 90, volts: 460 }, 'A',
      () => ({ raw: pumps.estimateFla(200, 1780, 60, efficiencyClass, 90, 460),
        displayed: psat.estFLA(200, 1780, 60, efficiencyClass, 90, 460, imperial) }));
    for (const load of [0, 25, 75, 100, 150]) {
      capture(`current-${efficiencyClass}-${load}`, { hp: 200, rpm: 1780, hz: 60, efficiencyClass,
        efficiencyPercent: 90, loadPercent: load, volts: 460, suppliedFLA: 225 }, 'A',
        () => ({ raw: pumps.motorCurrent(200, 1780, 60, efficiencyClass, 90, load, 460, 225),
          displayed: psat.motorCurrent(200, 1780, 60, efficiencyClass, load, 460, 225, 90, imperial) }));
    }
    for (const load of [0.25, 0.75, 1]) {
      capture(`performance-${efficiencyClass}-${load}`, { hp: 200, rpm: 1780, hz: 60,
        efficiencyClass, efficiencyPercent: 90, loadFraction: load, volts: 460, suppliedFLA: 225 },
        'current as % of supplied FLA; efficiency/PF %', () => ({
          raw: pumps.motorPerformance(60, efficiencyClass, 200, 1780, 90, 460, 225, load),
          displayed: psat.motorPerformance(60, efficiencyClass, 200, 1780, 90, 460, 225, load, imperial),
        }));
    }
  }
  for (const settings of [imperial, metric]) {
    const power = settings === metric ? convert.value(200).from('hp').to('kW') : 200;
    capture(`inventory-${settings.unitsOfMeasure}`, { power, rpm: 1780, hz: 60,
      efficiencyPercent: 90, volts: 460, suppliedFLA: 225, loadsPercent: [25, 50, 75, 100], settings },
      'current A; efficiency/PF %; UI values already rounded', () => inventoryResults(psat, settings, power));
  }
  // The old five-argument PF constructor and MotorPerformance zero-load path had uninitialized nameplate data.
  // Capture these last, including errors/nonfinite values, so their approved correction is explicit.
  for (const load of [0, 0.05, 0.1, 75]) {
    capture(`power-factor-${load}`, { hp: 200, rpm: 1780, hz: 60, efficiencyClass: 1,
      specifiedEfficiencyPercent: 90, loadPercent: load, currentA: 60, efficiencyPercent: 90, volts: 460 }, '%',
      () => ({ raw: pumps.motorPowerFactor(200, load, 60, 90, 460, 60, 1780, 1, 90),
        displayed: psat.motorPowerFactor(200, load, 60, 90, 460, 60, 1780, 1, 90, imperial) }));
  }
  for (const efficiencyClass of [1, 3]) {
    capture(`performance-${efficiencyClass}-zero`, { hp: 200, rpm: 1780, hz: 60, efficiencyClass,
      efficiencyPercent: 90, loadFraction: 0, volts: 460, suppliedFLA: 225 },
      'current as % of supplied FLA; efficiency/PF %', () => ({
        raw: pumps.motorPerformance(60, efficiencyClass, 200, 1780, 90, 460, 225, 0),
        displayed: psat.motorPerformance(60, efficiencyClass, 200, 1780, 90, 460, 225, 0, imperial),
      }));
  }
  return scenarios;
}

function inventoryResults(psat: PsatService, settings: Settings, power: number): unknown {
  const motor = { id: 'synthetic-motor', departmentId: 'synthetic-department',
    nameplateData: { ratedMotorPower: power, fullLoadSpeed: 1780, lineFrequency: 60,
      efficiencyClass: 3, nominalEfficiency: 90, ratedVoltage: 460, fullLoadAmps: 225 },
    loadCharacteristicData: { efficiency25: 85, efficiency50: 89, efficiency75: 90 },
    operationData: { averageLoadFactor: 75, efficiencyAtAverageLoad: 90, currentAtLoad: 175 },
  } as MotorItem;
  const inventory = jasmine.createSpyObj<MotorInventoryService>('MotorInventoryService', ['updateMotorItem'], {
    settings: new BehaviorSubject(settings), motorInventoryData: new BehaviorSubject({
      departments: [{ id: motor.departmentId, catalog: [motor] }],
    } as MotorInventoryData),
  });
  const catalog = new MotorCatalogService(inventory, psat);
  catalog.selectedMotorItem.next(motor);
  const forms = new UntypedFormBuilder();
  const loadData = new LoadCharacteristicDataService(forms);
  const load = new LoadCharacteristicDataComponent(catalog, psat, inventory, loadData);
  load.selectedMotorItem = motor;
  load.motorForm = loadData.getFormFromLoadCharacteristicData(motor.loadCharacteristicData);
  load.calculateMotorPowerFactor25(); load.calculateMotorPowerFactor50();
  load.calculateMotorPowerFactor75(); load.calculateMotorPowerFactor100();
  const operationsData = new OperationsDataService(forms);
  const operations = new OperationsDataComponent(catalog, inventory, operationsData, psat, null);
  operations.motorForm = operationsData.getFormFromOperationData(motor.operationData);
  operations.calculatePowerFactor();
  return { load: { ...motor.loadCharacteristicData }, operations: operations.motorForm.getRawValue(),
    currentAt75: catalog.estimateCurrent(75), efficiencyAt75: catalog.estimateEfficiency(75, true) };
}
