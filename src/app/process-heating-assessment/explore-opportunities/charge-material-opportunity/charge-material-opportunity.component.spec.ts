import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { PHAST } from '../../models/phast';
import { ScenarioOverrides, ProcessHeatingModification } from '../../models/modification';
import { getEffectivePhast } from '../../services/scenario-merge.util';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { ChargeMaterialOpportunityComponent } from './charge-material-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    chargeMaterials: [
      {
        id: 'material-1',
        name: 'Steel',
        chargeMaterialType: 'Solid',
        solidChargeMaterial: { initialTemperature: 70, specificHeatSolid: 0.12 },
      } as never,
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

describe('ChargeMaterialOpportunityComponent', () => {
  let fixture: ComponentFixture<ChargeMaterialOpportunityComponent>;
  let component: ChargeMaterialOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChargeMaterialOpportunityComponent],
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

    fixture = TestBed.createComponent(ChargeMaterialOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('resets the material initial temperature back to baseline when the opportunity is deselected', () => {
    component.toggleOpportunity(true);
    component.setModificationInitialTemperature('material-1', 200);
    expect(component.materialTemperatureComparisons()[0].modificationInitialTemperature).toBe(200);

    component.toggleOpportunity(false);

    expect(component.useOpportunity()).toBe(false);
    expect(component.materialTemperatureComparisons()[0].modificationInitialTemperature).toBe(70);
  });

  it('leaves other overridden fields on the material untouched when resetting its temperature', () => {
    component.toggleOpportunity(true);
    component.setModificationInitialTemperature('material-1', 200);

    const modificationId = modificationService.selectedModificationId();
    const modification = modificationService.selectedModification();
    assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      chargeMaterials: modification.scenarioOverrides?.losses?.chargeMaterials?.map(material =>
        material.id === 'material-1'
          ? { ...material, solidChargeMaterial: { ...(material as { solidChargeMaterial: { specificHeatSolid: number } }).solidChargeMaterial, specificHeatSolid: 0.5 } }
          : material
      ),
    });

    component.toggleOpportunity(false);

    const effectiveMaterial = assessmentService
      .scenarioPhast(modificationId)
      ?.losses?.chargeMaterials?.find(material => material.id === 'material-1') as unknown as {
        solidChargeMaterial: { initialTemperature: number; specificHeatSolid: number };
      };
    expect(effectiveMaterial.solidChargeMaterial.initialTemperature).toBe(70);
    expect(effectiveMaterial.solidChargeMaterial.specificHeatSolid).toBe(0.5);
  });
});
