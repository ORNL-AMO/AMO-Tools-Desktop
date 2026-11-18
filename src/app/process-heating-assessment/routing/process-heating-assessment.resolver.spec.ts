import { ProviderToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AtmosphereDbService } from '../../indexedDb/atmosphere-db.service';
import { GasLoadMaterialDbService } from '../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../indexedDb/liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from '../../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { PHAST } from '../models/phast';
import { ProcessHeatingAssessmentResolver } from './process-heating-assessment.resolver';

const settings: Settings = { id: 1, assessmentId: 1 } as Settings;

class FakeAssessmentDbService {
  constructor(private readonly assessment: Assessment) {}

  findById(): Assessment {
    return this.assessment;
  }
}

class FakeSettingsDbService {}

const MATERIAL_DB_SERVICES: ProviderToken<{ setAllMaterialsFromDb(): Promise<void> }>[] = [SolidLoadMaterialDbService, LiquidLoadMaterialDbService, GasLoadMaterialDbService, AtmosphereDbService, WallLossesSurfaceDbService];

class FakeAppErrorService {
  handleAppError(): void {}
}

class FakeProcessHeatingAssessmentService {
  assessmentValue: Assessment | undefined = undefined;
  settingsValue: Settings | undefined = undefined;
  readonly settings$ = of(settings);

  setProcessHeatingCalls: PHAST[] = [];

  setAssessment(): void {}

  setProcessHeating(phast: PHAST): void {
    this.setProcessHeatingCalls.push(phast);
  }

  initAssessmentSettings(): Promise<void> {
    return Promise.resolve();
  }
}

function buildRoute(id: string): ActivatedRouteSnapshot {
  return { paramMap: convertToParamMap({ assessmentId: id }) } as ActivatedRouteSnapshot;
}

function configure(assessment: Assessment): FakeProcessHeatingAssessmentService {
  const fakeAssessmentService = new FakeProcessHeatingAssessmentService();
  TestBed.configureTestingModule({
    providers: [
      ProcessHeatingAssessmentResolver,
      { provide: AssessmentDbService, useValue: new FakeAssessmentDbService(assessment) },
      { provide: SettingsDbService, useClass: FakeSettingsDbService },
      { provide: AppErrorService, useClass: FakeAppErrorService },
      { provide: ProcessHeatingAssessmentService, useValue: fakeAssessmentService },
      { provide: Router, useValue: { navigate: () => {} } },
      ...MATERIAL_DB_SERVICES.map(service => ({
        provide: service,
        useFactory: () => jasmine.createSpyObj('MaterialDbService', { setAllMaterialsFromDb: Promise.resolve() }),
      })),
    ],
  });
  return fakeAssessmentService;
}

describe('ProcessHeatingAssessmentResolver', () => {
  const baselinePhast = {
    name: 'Baseline',
    systemEfficiency: 80,
    losses: { chargeMaterials: [{ id: 'material-1', name: 'Steel' } as never] },
  };

  it('reloads every material list on open, including when the assessment is already loaded', async () => {
    const fakeAssessmentService = configure({ id: 1, phast: baselinePhast } as unknown as Assessment);
    const resolver = TestBed.inject(ProcessHeatingAssessmentResolver);
    const refreshSpies = MATERIAL_DB_SERVICES.map(service => TestBed.inject(service).setAllMaterialsFromDb);

    await firstValueFrom(resolver.resolve(buildRoute('1')));
    refreshSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));

    fakeAssessmentService.assessmentValue = { id: 1 } as Assessment;
    fakeAssessmentService.settingsValue = settings;
    await firstValueFrom(resolver.resolve(buildRoute('1')));
    refreshSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(2));
  });

  it('migrates scenarioOverrides for a legacy modification (phast clone, no scenarioOverrides)', async () => {
    const legacyModificationPhast = {
      ...baselinePhast,
      systemEfficiency: 90,
    };
    const assessment: Assessment = {
      id: 1,
      type: 'PHAST',
      name: 'Assessment 1',
      phast: {
        ...baselinePhast,
        modifications: [{ id: 'mod-1', phast: legacyModificationPhast }],
      } as never,
    };
    const fakeAssessmentService = configure(assessment);
    const resolver = TestBed.inject(ProcessHeatingAssessmentResolver);

    await firstValueFrom(resolver.resolve(buildRoute('1')));

    const migrated = fakeAssessmentService.setProcessHeatingCalls[0];
    const modification = migrated.modifications[0] as unknown as { scenarioOverrides: { systemEfficiency?: number } };
    expect(modification.scenarioOverrides.systemEfficiency).toBe(90);
  });

  it('leaves a modification that already has scenarioOverrides untouched', async () => {
    const existingModification = { id: 'mod-1', scenarioOverrides: { systemEfficiency: 95 } };
    const assessment: Assessment = {
      id: 1,
      type: 'PHAST',
      name: 'Assessment 1',
      phast: {
        ...baselinePhast,
        modifications: [existingModification],
      } as never,
    };
    const fakeAssessmentService = configure(assessment);
    const resolver = TestBed.inject(ProcessHeatingAssessmentResolver);

    await firstValueFrom(resolver.resolve(buildRoute('1')));

    const migrated = fakeAssessmentService.setProcessHeatingCalls[0];
    expect(migrated.modifications[0]).toBe(existingModification);
  });

  it('does not touch modification.phast on the migrated record', async () => {
    const legacyModificationPhast = { ...baselinePhast, systemEfficiency: 90 };
    const assessment: Assessment = {
      id: 1,
      type: 'PHAST',
      name: 'Assessment 1',
      phast: {
        ...baselinePhast,
        modifications: [{ id: 'mod-1', phast: legacyModificationPhast }],
      } as never,
    };
    const fakeAssessmentService = configure(assessment);
    const resolver = TestBed.inject(ProcessHeatingAssessmentResolver);

    await firstValueFrom(resolver.resolve(buildRoute('1')));

    const migrated = fakeAssessmentService.setProcessHeatingCalls[0];
    const modification = migrated.modifications[0] as unknown as { phast: unknown };
    expect(modification.phast).toBe(legacyModificationPhast);
  });

  it('migrates legacy exploreOppsShowX flags into exploreOpportunityFlags without deleting the legacy fields', async () => {
    const legacyModificationPhast = { ...baselinePhast, systemEfficiency: 90 };
    const flueGasOpportunity = { hasOpportunity: true, display: 'Flue Gas' };
    const assessment: Assessment = {
      id: 1,
      type: 'PHAST',
      name: 'Assessment 1',
      phast: {
        ...baselinePhast,
        modifications: [{ id: 'mod-1', phast: legacyModificationPhast, exploreOppsShowFlueGas: flueGasOpportunity }],
      } as never,
    };
    const fakeAssessmentService = configure(assessment);
    const resolver = TestBed.inject(ProcessHeatingAssessmentResolver);

    await firstValueFrom(resolver.resolve(buildRoute('1')));

    const migrated = fakeAssessmentService.setProcessHeatingCalls[0];
    const modification = migrated.modifications[0] as unknown as {
      exploreOpportunityFlags: { flueGas?: unknown };
      exploreOppsShowFlueGas: unknown;
    };
    expect(modification.exploreOpportunityFlags.flueGas).toBe(flueGasOpportunity);
    expect(modification.exploreOppsShowFlueGas).toBe(flueGasOpportunity);
  });
});
