import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { PHAST } from '../../models/phast';
import { ScenarioOverrides, ProcessHeatingModification } from '../../models/modification';
import { getEffectivePhast } from '../../services/scenario-merge.util';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { AtmosphereOpportunityComponent } from './atmosphere-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    atmosphereLosses: [
      { id: 'atm-1', name: 'Atmosphere 1', flowRate: 1000, inletTemperature: 100, outletTemperature: 1200, specificHeat: 0.02 },
      { id: 'atm-2', name: 'Atmosphere 2', flowRate: 500, inletTemperature: 80, outletTemperature: 900, specificHeat: 0.02 },
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

  lossSignal(scenario: string, lossKey: keyof PHAST['losses']) {
    return this.scenarioPhast(scenario)?.losses?.[lossKey];
  }
}

class FakeProcessHeatingUiService {
  activeModificationIdSignal: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
}

describe('AtmosphereOpportunityComponent', () => {
  let fixture: ComponentFixture<AtmosphereOpportunityComponent>;
  let component: AtmosphereOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(id: string): AtmosphereLoss | undefined {
    return assessmentService
      .scenarioPhast(modificationService.selectedModificationId())
      ?.losses?.atmosphereLosses?.find(loss => loss.id === id);
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(AtmosphereOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AtmosphereOpportunityComponent],
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
  });

  describe('opportunity toggle', () => {
    beforeEach(() => createComponent());

    it('hides the per-loss sections when the opportunity is not selected', () => {
      expect(component.useOpportunity()).toBe(false);
      expect(fixture.nativeElement.querySelector('ul')).toBeNull();
    });

    it('renders a section group per baseline loss when the opportunity is selected', () => {
      component.toggleOpportunity(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('ul').length).toBe(2);
    });

    it('resets flow rate and inlet/outlet temperature to baseline when deselected', () => {
      component.toggleOpportunity(true);
      component.setModificationValue('atm-1', 'flowRate', 800);
      component.setModificationValue('atm-1', 'inletTemperature', 300);
      component.setModificationValue('atm-2', 'outletTemperature', 700);

      component.toggleOpportunity(false);

      expect(component.useOpportunity()).toBe(false);
      expect(effectiveLoss('atm-1')).toEqual(jasmine.objectContaining({ flowRate: 1000, inletTemperature: 100 }));
      expect(effectiveLoss('atm-2').outletTemperature).toBe(900);
    });

    it('leaves fields this EEM does not own untouched when resetting', () => {
      component.toggleOpportunity(true);
      component.setModificationValue('atm-1', 'flowRate', 800);
      const modification = modificationService.selectedModification();
      assessmentService.updateModificationProperty(modification.id, 'losses', {
        ...modification.scenarioOverrides?.losses,
        atmosphereLosses: modification.scenarioOverrides?.losses?.atmosphereLosses?.map(loss =>
          loss.id === 'atm-1' ? { ...loss, specificHeat: 0.05 } : loss
        ),
      });

      component.toggleOpportunity(false);

      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
      expect(effectiveLoss('atm-1').specificHeat).toBe(0.05);
    });
  });

  describe('per-loss sections', () => {
    beforeEach(() => {
      createComponent();
      component.toggleOpportunity(true);
    });

    it('starts collapsed when the modification matches baseline', () => {
      expect(component.isExpanded('flowRate', 'atm-1')).toBe(false);
      expect(component.isExpanded('temperature', 'atm-1')).toBe(false);
    });

    it('stays expanded after the value is typed back to baseline', () => {
      component.toggleSection('flowRate', 'atm-1', true);
      component.setModificationValue('atm-1', 'flowRate', 800);
      component.setModificationValue('atm-1', 'flowRate', 1000);

      expect(component.isExpanded('flowRate', 'atm-1')).toBe(true);
    });

    it('resets only the flow rate of that loss when its flow rate section is closed', () => {
      component.toggleSection('flowRate', 'atm-1', true);
      component.toggleSection('temperature', 'atm-1', true);
      component.setModificationValue('atm-1', 'flowRate', 800);
      component.setModificationValue('atm-1', 'inletTemperature', 300);
      component.setModificationValue('atm-2', 'flowRate', 400);

      component.toggleSection('flowRate', 'atm-1', false);

      expect(component.isExpanded('flowRate', 'atm-1')).toBe(false);
      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
      expect(effectiveLoss('atm-1').inletTemperature).toBe(300);
      expect(effectiveLoss('atm-2').flowRate).toBe(400);
    });

    it('resets both inlet and outlet temperature when the temperature section is closed', () => {
      component.toggleSection('temperature', 'atm-1', true);
      component.setModificationValue('atm-1', 'inletTemperature', 300);
      component.setModificationValue('atm-1', 'outletTemperature', 1100);

      component.toggleSection('temperature', 'atm-1', false);

      expect(effectiveLoss('atm-1')).toEqual(jasmine.objectContaining({ inletTemperature: 100, outletTemperature: 1200 }));
    });

    it('keeps another loss override when editing a different loss', () => {
      component.setModificationValue('atm-1', 'flowRate', 800);
      component.setModificationValue('atm-2', 'flowRate', 400);

      expect(effectiveLoss('atm-1').flowRate).toBe(800);
      expect(effectiveLoss('atm-2').flowRate).toBe(400);
    });

    it('ignores a NaN value from a cleared input', () => {
      component.setModificationValue('atm-1', 'flowRate', NaN);

      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
    });
  });

  describe('section seeding', () => {
    it('opens sections that already differ from baseline when the component loads', () => {
      const modification = modificationService.selectedModification();
      assessmentService.updateModificationProperty(modification.id, 'losses', {
        ...modification.scenarioOverrides?.losses,
        atmosphereLosses: BASELINE.losses.atmosphereLosses.map(loss =>
          loss.id === 'atm-2' ? { ...loss, outletTemperature: 700 } : loss
        ),
      });

      createComponent();

      expect(component.isExpanded('temperature', 'atm-2')).toBe(true);
      expect(component.isExpanded('flowRate', 'atm-2')).toBe(false);
      expect(component.isExpanded('temperature', 'atm-1')).toBe(false);
    });

    it('reseeds sections when switching to another modification', () => {
      createComponent();
      component.toggleOpportunity(true);
      component.toggleSection('flowRate', 'atm-1', true);

      modificationService.addModification('Scenario 2');

      expect(component.isExpanded('flowRate', 'atm-1')).toBe(false);
    });
  });

  describe('warnings', () => {
    beforeEach(() => {
      createComponent();
      component.toggleOpportunity(true);
      component.toggleSection('flowRate', 'atm-1', true);
      component.toggleSection('temperature', 'atm-1', true);
    });

    it('warns on a negative modification flow rate', () => {
      component.setModificationValue('atm-1', 'flowRate', -5);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Flow Rate must be greater than 0');
    });

    it('warns when the modification inlet temperature exceeds outlet', () => {
      component.setModificationValue('atm-1', 'inletTemperature', 1500);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Inlet temperature is greater than outlet temperature');
    });

    it('warns on the baseline side when the baseline inlet temperature exceeds outlet', () => {
      assessmentService.updateProcessHeatingProperty('losses', {
        atmosphereLosses: BASELINE.losses.atmosphereLosses.map(loss =>
          loss.id === 'atm-1' ? { ...loss, inletTemperature: 1500 } : loss
        ),
      });
      fixture.detectChanges();

      expect(component.comparisons()[0].baselineWarnings.temperatureWarning).toBe('Inlet temperature is greater than outlet temperature');
      expect(component.comparisons()[0].modificationWarnings.temperatureWarning).toBeNull();
    });

    it('shows no warnings for valid values', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });
  });
});
