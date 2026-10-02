/**
 * snapshot.helper.ts
 *
 * Wires up the full PhastResultsService chain via direct instantiation (no TestBed).
 * All services in the chain take only UntypedFormBuilder and/or ConvertUnitsService —
 * no IndexedDB dependencies are needed for the fuel-fired By Volume heating system configuration.
 *
 * ProcessHeatingResultsService.getResults() delegates to this exact PhastResultsService.getResults()
 * call (see services/process-heating-results.service.ts) — these snapshots exercise that same
 * calculation surface directly, skipping the thin null-guard wrapper.
 *
 * Usage: call buildPhastServices() in a beforeAll — it initializes WASM internally.
 */
import { UntypedFormBuilder } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ToolsSuiteApiService } from '../../tools-suite-api/tools-suite-api.service';
import { SuiteApiHelperService } from '../../tools-suite-api/suite-api-helper.service';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { PhastService } from '../../phast/phast.service';
import { PhastResultsService } from '../../phast/phast-results.service';
import { AuxEquipmentService } from '../../phast/aux-equipment/aux-equipment.service';
import { Co2SavingsPhastService } from '../../phast/losses/operations/co2-savings-phast/co2-savings-phast.service';
import { EnergyInputExhaustGasService } from '../../phast/losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputService } from '../../phast/losses/energy-input/energy-input.service';
import { OpeningFormService } from '../../calculator/furnaces/opening/opening-form.service';
import { AtmosphereFormService } from '../../calculator/furnaces/atmosphere/atmosphere-form.service';
import { AuxiliaryPowerLossesService } from '../../phast/losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { CoolingFormService } from '../../calculator/furnaces/cooling/cooling-form.service';
import { WallFormService } from '../../calculator/furnaces/wall/wall-form.service';
import { LeakageFormService } from '../../calculator/furnaces/leakage/leakage-form.service';
import { FixtureFormService } from '../../calculator/furnaces/fixture/fixture-form.service';
import { OtherLossesService } from '../../phast/losses/other-losses/other-losses.service';
import { LiquidMaterialFormService } from '../../calculator/furnaces/charge-material/liquid-material-form/liquid-material-form.service';
import { GasMaterialFormService } from '../../calculator/furnaces/charge-material/gas-material-form/gas-material-form.service';
import { SolidMaterialFormService } from '../../calculator/furnaces/charge-material/solid-material-form/solid-material-form.service';
import { SlagService } from '../../phast/losses/slag/slag.service';
import { ExhaustGasService } from '../../phast/losses/exhaust-gas/exhaust-gas.service';
import { FlueGasFormService } from '../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { FIXTURES } from './snapshot-fixtures';

export interface PhastServices {
  phastResultsService: PhastResultsService;
  processHeatingApiService: ProcessHeatingApiService;
  convertUnitsService: ConvertUnitsService;
}

const FUEL_ANALYSIS_KEYS = ['carbon', 'hydrogen', 'sulphur', 'inertAsh', 'o2', 'moisture', 'nitrogen'] as const;

/**
 * Stands in for the fuel database using the By Mass flue gas entries already in FIXTURES, keyed by
 * `gasTypeId`. Throws if two entries share an id but not an analysis, since one id cannot serve both:
 * give the new fixture's fuel a distinct `gasTypeId` or pass `solidLiquidMaterialDbService` explicitly.
 */
export function createFixtureFuelDb(): Pick<SolidLiquidMaterialDbService, 'getById'> {
  const fuels = new Map<number, SolidLiquidFlueGasMaterial>();
  for (const { name, fixture } of FIXTURES) {
    const phast = fixture.assessments[0].assessment.phast;
    const losses = [phast.losses, ...(phast.modifications ?? []).map((modification: any) => modification.phast?.losses)];
    for (const flueGas of losses.flatMap(loss => loss?.flueGasLosses ?? [])) {
      const mass = flueGas.flueGasByMass;
      if (flueGas.flueGasType !== 'By Mass' || !mass) continue;
      const fuel: SolidLiquidFlueGasMaterial = {
        id: mass.gasTypeId, substance: `${name} fuel`, isDefault: false, heatingValue: 0,
        ...Object.fromEntries(FUEL_ANALYSIS_KEYS.map(key => [key, mass[key]])),
      } as SolidLiquidFlueGasMaterial;
      const existing = fuels.get(fuel.id);
      if (existing && FUEL_ANALYSIS_KEYS.some(key => existing[key] !== fuel[key])) {
        throw new Error(`Fixtures give fuel id ${fuel.id} different analyses (see ${name}); use a distinct gasTypeId.`);
      }
      fuels.set(fuel.id, fuel);
    }
  }
  return { getById: (id: number) => fuels.get(id) };
}

export interface PhastServiceOptions {
  /** Defaults to {@link createFixtureFuelDb}. Legacy looks the fuel up by id to derive O2 / excess air for By Mass flue gas. */
  solidLiquidMaterialDbService?: Pick<SolidLiquidMaterialDbService, 'getById'>;
}

export async function buildPhastServices(options: PhastServiceOptions = {}): Promise<PhastServices> {
  const fb = new UntypedFormBuilder();
  const convertUnitsService = new ConvertUnitsService();

  const toolsSuiteApiService = new ToolsSuiteApiService(
    null as any, // settingsDbService
    null as any, // atmosphereDbService
    null as any, // flueGasMaterialDbService
    null as any, // gasLoadMaterialDbService
    null as any, // liquidLoadMaterialDbService
    null as any, // solidLiquidMaterialDbService
    null as any, // solidLoadMaterialDbService
    null as any, // wallLossesSurfaceDbService
    { isElectron: false } as any
  );
  await toolsSuiteApiService.initializeModule();

  const suiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
  const processHeatingApiService = new ProcessHeatingApiService(suiteApiHelperService, toolsSuiteApiService);

  const phastService = new PhastService(
    new OpeningFormService(fb),
    convertUnitsService,
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

  const phastResultsService = new PhastResultsService(
    phastService,
    new FlueGasFormService(fb, convertUnitsService),
    new AuxEquipmentService(convertUnitsService),
    convertUnitsService,
    new EnergyInputExhaustGasService(fb),
    new EnergyInputService(fb, convertUnitsService),
    (options.solidLiquidMaterialDbService ?? createFixtureFuelDb()) as any, // SolidLiquidMaterialDbService — only the By Mass flue gas path uses it
    new Co2SavingsPhastService(convertUnitsService, fb),
    null as any, // FlueGasMaterialDbService — not used in getResults()
  );

  return { phastResultsService, processHeatingApiService, convertUnitsService };
}
