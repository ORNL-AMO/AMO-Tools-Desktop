/**
 * No fixture has a Flue Gas By Mass entry (refactor-plan/snapshot-test-coverage.md, gap 13), so this
 * swaps one into the Fuel Example baseline and checks the new FlueGasCalculationService against the
 * legacy PhastResultsService run live on the same data, with the real suite WASM.
 *
 * Legacy looks the fuel up by id to derive O2 / excess air, so the stubbed material carries the same
 * analysis as the loss. Its suite call reads the stored `excessAirPercentage` as-is, which the legacy
 * form fills in from the entered O2, so the Oxygen in Flue Gas cases store that derived value too.
 */
import { Injector } from '@angular/core';
import { FlueGas } from '../../shared/models/phast/losses/flueGas';
import { SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { PhastResults, PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { FlueGasCalculationService } from '../heat-balance/losses/flue-gas/flue-gas-calculation.service';
import { buildPhastServices, PhastServices } from './snapshot.helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fixture = require('./fixtures/Process Heating - Fuel Example.json');

const FUEL_ANALYSIS = { carbon: 75, hydrogen: 5, sulphur: 1, inertAsh: 8, o2: 8, moisture: 2, nitrogen: 1 };
const MATERIAL: SolidLiquidFlueGasMaterial = { id: 1, substance: 'Test fuel', ...FUEL_ANALYSIS, heatingValue: 12000, isDefault: false };

const IMPERIAL_TEMPERATURES = {
  flueGasTemperature: 1800, combustionAirTemperature: 400, fuelTemperature: 65, ambientAirTemp: 60, ashDischargeTemperature: 200,
};
const METRIC_TEMPERATURES = {
  flueGasTemperature: 980, combustionAirTemperature: 200, fuelTemperature: 20, ambientAirTemp: 15, ashDischargeTemperature: 90,
};

function byMassLoss(overrides: Partial<FlueGas['flueGasByMass']>): FlueGas {
  return {
    name: 'Flue Gas',
    flueGasType: 'By Mass',
    flueGasByMass: {
      gasTypeId: MATERIAL.id,
      ...IMPERIAL_TEMPERATURES,
      oxygenCalculationMethod: 'Excess Air',
      excessAirPercentage: 20,
      o2InFlueGas: 0,
      moistureInAirCombustion: 1.5,
      unburnedCarbonInAsh: 2,
      ...FUEL_ANALYSIS,
      ...overrides,
    },
  };
}

describe('Flue gas By Mass vs. legacy results', () => {
  let services: PhastServices;
  let flueGas: FlueGasCalculationService;

  beforeAll(async () => {
    services = await buildPhastServices({ solidLiquidMaterialDbService: { getById: () => MATERIAL } });
    const injector = Injector.create({
      providers: [
        { provide: ConvertUnitsService, useValue: services.convertUnitsService },
        { provide: ProcessHeatingApiService, useValue: services.processHeatingApiService },
        { provide: FlueGasCalculationService, useClass: FlueGasCalculationService, deps: [] },
      ],
    });
    flueGas = injector.get(FlueGasCalculationService);
  });

  function withStoredExcessAir(loss: FlueGas): FlueGas {
    const mass = loss.flueGasByMass;
    if (mass.oxygenCalculationMethod !== 'Oxygen in Flue Gas') return loss;
    const excessAirPercentage = services.processHeatingApiService.flueGasByMassCalculateExcessAir({
      ...FUEL_ANALYSIS, o2InFlueGas: mass.o2InFlueGas, moistureInAirCombustion: mass.moistureInAirCombustion,
    });
    return { ...loss, flueGasByMass: { ...mass, excessAirPercentage } };
  }

  function legacyResults(loss: FlueGas, settings: Settings): PhastResults {
    const phast: PHAST = { ...fixture.assessments[0].assessment.phast, losses: { ...fixture.assessments[0].assessment.phast.losses, flueGasLosses: [loss] } };
    return JSON.parse(JSON.stringify(services.phastResultsService.getResults(phast, settings)));
  }

  const cases: { label: string; loss: FlueGas; unitsOfMeasure: 'Imperial' | 'Metric' }[] = [
    { label: 'Excess Air, Imperial', loss: byMassLoss({}), unitsOfMeasure: 'Imperial' },
    { label: 'Oxygen in Flue Gas, Imperial', loss: byMassLoss({ oxygenCalculationMethod: 'Oxygen in Flue Gas', excessAirPercentage: 0, o2InFlueGas: 3.5 }), unitsOfMeasure: 'Imperial' },
    { label: 'Excess Air, Metric', loss: byMassLoss({ ...METRIC_TEMPERATURES }), unitsOfMeasure: 'Metric' },
    { label: 'Oxygen in Flue Gas, Metric', loss: byMassLoss({ ...METRIC_TEMPERATURES, oxygenCalculationMethod: 'Oxygen in Flue Gas', excessAirPercentage: 0, o2InFlueGas: 3.5 }), unitsOfMeasure: 'Metric' },
  ];

  for (const { label, loss, unitsOfMeasure } of cases) {
    it(`${label} matches legacy available heat, O2 and excess air`, () => {
      const settings: Settings = { ...fixture.assessments[0].settings, unitsOfMeasure };
      const stored = withStoredExcessAir(loss);
      const legacy = legacyResults(stored, settings);

      const actual = flueGas.calculateByMass(loss.flueGasByMass, settings);

      expect(legacy.flueGasAvailableHeat).withContext('legacy produced a result').toBeGreaterThan(0);
      expect(actual.availableHeat).withContext('availableHeat').toBeCloseTo(legacy.flueGasAvailableHeat, 6);
      expect(actual.calculatedFlueGasO2).withContext('calculatedFlueGasO2').toBeCloseTo(legacy.calculatedFlueGasO2, 6);
      expect(actual.calculatedExcessAir).withContext('calculatedExcessAir').toBeCloseTo(legacy.calculatedExcessAir, 6);
    });
  }
});
