/**
 * PhastService — Metric input conversion tests
 *
 * Each test verifies that calling a loss method with SI (Metric) inputs
 * produces the same energy as calling it with the equivalent Imperial inputs.
 * Imperial equivalents are built via ConvertPhastService, making these tests
 * also sensitive to any field-mapping divergence between the two services.
 *
 * Requires WASM initialisation — uses the same direct-instantiation
 * pattern as the snapshot helper.
 */
import { UntypedFormBuilder } from '@angular/forms';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { ConvertPhastService } from './convert-phast.service';
import { PhastService } from './phast.service';
import { AtmosphereFormService } from '../calculator/furnaces/atmosphere/atmosphere-form.service';
import { AuxiliaryPowerLossesService } from './losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { CoolingFormService } from '../calculator/furnaces/cooling/cooling-form.service';
import { ExhaustGasService } from './losses/exhaust-gas/exhaust-gas.service';
import { FixtureFormService } from '../calculator/furnaces/fixture/fixture-form.service';
import { GasMaterialFormService } from '../calculator/furnaces/charge-material/gas-material-form/gas-material-form.service';
import { LeakageFormService } from '../calculator/furnaces/leakage/leakage-form.service';
import { LiquidMaterialFormService } from '../calculator/furnaces/charge-material/liquid-material-form/liquid-material-form.service';
import { OpeningFormService } from '../calculator/furnaces/opening/opening-form.service';
import { OtherLossesService } from './losses/other-losses/other-losses.service';
import { ProcessHeatingApiService } from '../tools-suite-api/process-heating-api.service';
import { SlagService } from './losses/slag/slag.service';
import { SolidMaterialFormService } from '../calculator/furnaces/charge-material/solid-material-form/solid-material-form.service';
import { SuiteApiHelperService } from '../tools-suite-api/suite-api-helper.service';
import { ToolsSuiteApiService } from '../tools-suite-api/tools-suite-api.service';
import { WallFormService } from '../calculator/furnaces/wall/wall-form.service';

const METRIC: Settings = { unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' };
const IMPERIAL: Settings = { unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu' };

describe('PhastService — Metric input conversion', () => {
  let phastService: PhastService;
  let convertPhastService: ConvertPhastService;
  let cs: ConvertUnitsService;

  beforeAll(async () => {
    const fb = new UntypedFormBuilder();
    cs = new ConvertUnitsService();
    convertPhastService = new ConvertPhastService(cs);

    const toolsSuiteApiService = new ToolsSuiteApiService(
      null as any, null as any, null as any, null as any,
      null as any, null as any, null as any, null as any,
      { isElectron: false } as any
    );
    await toolsSuiteApiService.initializeModule();

    const suiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
    const processHeatingApiService = new ProcessHeatingApiService(suiteApiHelperService, toolsSuiteApiService);

    phastService = new PhastService(
      new OpeningFormService(fb),
      cs,
      new AtmosphereFormService(fb),
      new AuxiliaryPowerLossesService(fb),
      new CoolingFormService(fb),
      new WallFormService(fb),
      new LeakageFormService(fb),
      new FixtureFormService(fb),
      new OtherLossesService(fb),
      new LiquidMaterialFormService(fb),
      new GasMaterialFormService(fb),
      new SolidMaterialFormService(fb),
      processHeatingApiService,
      new SlagService(fb),
      new ExhaustGasService(fb),
    );
  });

  // Convert both results to kWh so a single tolerance covers the GJ vs MMBtu difference.
  function toKwh(value: number, unit: 'GJ' | 'MMBtu'): number {
    return cs.value(value).from(unit).to('kWh');
  }

  describe('wallLosses', () => {
    const metricInput: WallLoss = {
      surfaceArea: 5,           // m2
      ambientTemperature: 25,   // °C
      surfaceTemperature: 200,  // °C
      windVelocity: 8,          // km/h
      surfaceEmissivity: 0.85,
      surfaceShape: 0,
      conditionFactor: 1.394,
      correctionFactor: 1.0,
    };

    it('Metric result matches equivalent Imperial result', () => {
      const imperialInput = convertPhastService.convertWallLoss({ ...metricInput }, METRIC, IMPERIAL);

      const metricGJ = phastService.wallLosses(metricInput, METRIC);
      const imperialMMBtu = phastService.wallLosses(imperialInput, IMPERIAL);

      expect(toKwh(metricGJ, 'GJ')).toBeCloseTo(toKwh(imperialMMBtu, 'MMBtu'), 3);
    });
  });

  describe('fixtureLosses', () => {
    const metricInput: FixtureLoss = {
      specificHeat: 0.50,     // kJ/kg·°C
      feedRate: 100,          // kg
      initialTemperature: 20, // °C
      finalTemperature: 500,  // °C
      correctionFactor: 1.0,
    };

    it('Metric result matches equivalent Imperial result', () => {
      const imperialInput = convertPhastService.convertFixtureLoss({ ...metricInput }, METRIC, IMPERIAL);

      const metricGJ = phastService.fixtureLosses(metricInput, METRIC);
      const imperialMMBtu = phastService.fixtureLosses(imperialInput, IMPERIAL);

      expect(toKwh(metricGJ, 'GJ')).toBeCloseTo(toKwh(imperialMMBtu, 'MMBtu'), 3);
    });
  });

  describe('leakageLosses', () => {
    const metricInput: LeakageLoss = {
      draftPressure: 2.5,           // Pa
      openingArea: 0.02,            // m2
      leakageGasTemperature: 800,   // °C
      ambientTemperature: 25,       // °C
      coefficient: 0.8,
      specificGravity: 1.0,
      correctionFactor: 1.0,
    };

    it('Metric result matches equivalent Imperial result', () => {
      const imperialInput = convertPhastService.convertLeakageLoss({ ...metricInput }, METRIC, IMPERIAL);

      const metricGJ = phastService.leakageLosses(metricInput, METRIC);
      const imperialMMBtu = phastService.leakageLosses(imperialInput, IMPERIAL);

      expect(toKwh(metricGJ, 'GJ')).toBeCloseTo(toKwh(imperialMMBtu, 'MMBtu'), 3);
    });
  });
});
