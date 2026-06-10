/**
 * snapshot.helper.ts
 *
 * Wires up the full PhastResultsService chain via direct instantiation (no TestBed).
 * All services in the chain take only UntypedFormBuilder and/or ConvertUnitsService —
 * no IndexedDB dependencies are needed for the fuel-fired By Volume pathway.
 *
 * Usage: call buildPhastServices() in a beforeAll — it initializes WASM internally.
 */
import { UntypedFormBuilder } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ToolsSuiteApiService } from '../../tools-suite-api/tools-suite-api.service';
import { SuiteApiHelperService } from '../../tools-suite-api/suite-api-helper.service';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { PhastService } from '../phast.service';
import { PhastResultsService } from '../phast-results.service';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { Co2SavingsPhastService } from '../losses/operations/co2-savings-phast/co2-savings-phast.service';
import { EnergyInputExhaustGasService } from '../losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputService } from '../losses/energy-input/energy-input.service';
import { OpeningFormService } from '../../calculator/furnaces/opening/opening-form.service';
import { AtmosphereFormService } from '../../calculator/furnaces/atmosphere/atmosphere-form.service';
import { AuxiliaryPowerLossesService } from '../losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { CoolingFormService } from '../../calculator/furnaces/cooling/cooling-form.service';
import { WallFormService } from '../../calculator/furnaces/wall/wall-form.service';
import { LeakageFormService } from '../../calculator/furnaces/leakage/leakage-form.service';
import { FixtureFormService } from '../../calculator/furnaces/fixture/fixture-form.service';
import { OtherLossesService } from '../losses/other-losses/other-losses.service';
import { LiquidMaterialFormService } from '../../calculator/furnaces/charge-material/liquid-material-form/liquid-material-form.service';
import { GasMaterialFormService } from '../../calculator/furnaces/charge-material/gas-material-form/gas-material-form.service';
import { SolidMaterialFormService } from '../../calculator/furnaces/charge-material/solid-material-form/solid-material-form.service';
import { SlagService } from '../losses/slag/slag.service';
import { ExhaustGasService } from '../losses/exhaust-gas/exhaust-gas.service';
import { FlueGasFormService } from '../../calculator/furnaces/flue-gas/flue-gas-form.service';

export interface PhastServices {
  phastResultsService: PhastResultsService;
}

export async function buildPhastServices(): Promise<PhastServices> {
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
    null as any, // SolidLiquidMaterialDbService — not used in By Volume flue gas path
    new Co2SavingsPhastService(convertUnitsService, fb),
    null as any, // FlueGasMaterialDbService — not used in getResults()
  );

  return { phastResultsService };
}
