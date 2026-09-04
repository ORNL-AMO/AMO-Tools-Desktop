import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { PHAST } from '../../models/phast';
import { ScenarioOverrides, ProcessHeatingModification } from '../../models/modification';
import { getEffectivePhast } from '../../services/scenario-merge.util';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { ExtendedSurfaceOpportunityComponent } from './extended-surface-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    extendedSurfaces: [
      { id: 'surface-1', name: 'Surface 1', surfaceTemperature: 300 },
    ],
  },
  modifications: [],
};

class FakeProcessHeatingAssessmentService {
  readonly processHeatingSignal: WritableSignal<PHAST> = signal<PHAST>(BASELINE);
  readonly settingsSignal: WritableSignal<Settings> = signal<Settings>({ unitsOfMeasure: 'Imperial' } as Settings);

  updateProcessHeatingProperty<K extends keyof PHAST>(key: K, value: PHAST[K]): void {
    this.processHeatingSignal.set({ ...this.processHeatingSignal(), [key]: value });
  }

  updateModificationProperty<K extends keyof ScenarioOverrides>(modificationId: string, key: K, value: ScenarioOverrides[K]): void {
    const current = this.processHeatingSignal();
    const modifications = (current.modifications ?? []) as ProcessHeatingModification[];
    const index = modifications.findIndex(modification => modification.id === modificationId);
    if (index === -1) return;
    const updated = [...modifications];
    updated[index] = { ...updated[index], scenarioOverrides: { ...updated[index].scenarioOverrides, [key]: value } };
    this.processHeatingSignal.set({ ...current, modifications: updated });
  }

  scenarioPhast(scenario: string): PHAST | undefined {
    const baseline = this.processHeatingSignal();
    if (scenario === 'baseline') {
      return baseline;
    }
    const modifications = (baseline.modifications ?? []) as ProcessHeatingModification[];
    const modification = modifications.find(candidate => candidate.id === scenario);
    return modification ? getEffectivePhast(baseline, modification) : undefined;
  }
}

class FakeProcessHeatingUiService {
  activeModificationIdSignal: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
}

describe('ExtendedSurfaceOpportunityComponent', () => {
  let fixture: ComponentFixture<ExtendedSurfaceOpportunityComponent>;
  let component: ExtendedSurfaceOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExtendedSurfaceOpportunityComponent],
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useClass: FakeProcessHeatingAssessmentService },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');

    fixture = TestBed.createComponent(ExtendedSurfaceOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('resets the extended surface temperature back to baseline when the opportunity is deselected', () => {
    component.toggleOpportunity(true);
    component.setModificationSurfaceTemperature('surface-1', 150);
    expect(component.surfaceTemperatureComparisons()[0].modificationSurfaceTemperature).toBe(150);

    component.toggleOpportunity(false);

    expect(component.useOpportunity()).toBe(false);
    expect(component.surfaceTemperatureComparisons()[0].modificationSurfaceTemperature).toBe(300);
  });

  it('leaves other overridden fields on the extended surface untouched when resetting its temperature', () => {
    component.toggleOpportunity(true);
    component.setModificationSurfaceTemperature('surface-1', 150);

    const modificationId = modificationService.selectedModificationId();
    const modification = modificationService.selectedModification();
    assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      extendedSurfaces: modification.scenarioOverrides?.losses?.extendedSurfaces?.map(surface =>
        surface.id === 'surface-1' ? { ...surface, surfaceEmissivity: 0.5 } : surface
      ),
    });

    component.toggleOpportunity(false);

    const effectiveSurface = assessmentService
      .scenarioPhast(modificationId)
      ?.losses?.extendedSurfaces?.find(surface => surface.id === 'surface-1');
    expect(effectiveSurface.surfaceTemperature).toBe(300);
    expect(effectiveSurface.surfaceEmissivity).toBe(0.5);
  });
});
