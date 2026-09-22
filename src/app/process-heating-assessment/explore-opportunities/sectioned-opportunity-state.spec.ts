import { TestBed } from '@angular/core/testing';
import { AtmosphereLoss } from '../../shared/models/phast/losses/atmosphereLoss';
import { ExploreOpportunityCategory, PHAST } from '../models/phast';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from './opportunity-test-fakes';
import { createSectionedOpportunityState, directField, SectionedOpportunityState } from './sectioned-opportunity-state';

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

type Field = 'flowRate' | 'inletTemperature' | 'outletTemperature';
type Section = 'flowRate' | 'temperature';

describe('createSectionedOpportunityState', () => {
  let state: SectionedOpportunityState<'atmosphereLosses', Field, Section>;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(id: string): AtmosphereLoss | undefined {
    return assessmentService
      .scenarioPhast(modificationService.selectedModificationId())
      ?.losses?.atmosphereLosses?.find(loss => loss.id === id);
  }

  function createState(): void {
    state = TestBed.runInInjectionContext(() => createSectionedOpportunityState<'atmosphereLosses', Field, Section>({
      lossKey: 'atmosphereLosses',
      category: ExploreOpportunityCategory.Atmosphere,
      displayName: 'Optimize Furnace Atmosphere Makeup System',
      fields: {
        flowRate: directField<AtmosphereLoss, 'flowRate'>('flowRate'),
        inletTemperature: directField<AtmosphereLoss, 'inletTemperature'>('inletTemperature'),
        outletTemperature: directField<AtmosphereLoss, 'outletTemperature'>('outletTemperature'),
      },
      sections: { flowRate: ['flowRate'], temperature: ['inletTemperature', 'outletTemperature'] },
    }));
  }

  function overrideModificationLoss(id: string, patch: Partial<AtmosphereLoss>): void {
    const modification = modificationService.selectedModification();
    assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      atmosphereLosses: effectiveLossList().map(loss => (loss.id === id ? { ...loss, ...patch } : loss)),
    });
  }

  function effectiveLossList(): AtmosphereLoss[] {
    return assessmentService.lossSignal(modificationService.selectedModificationId(), 'atmosphereLosses') as AtmosphereLoss[];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useValue: new FakeProcessHeatingAssessmentService(BASELINE) },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
      ],
    });

    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');
  });

  describe('opportunity toggle', () => {
    beforeEach(() => createState());

    it('sets the explore opportunity flag with the display name', () => {
      state.toggleOpportunity(true);

      expect(state.useOpportunity()).toBe(true);
      expect(modificationService.selectedModification().exploreOpportunityFlags.atmosphere)
        .toEqual({ hasOpportunity: true, display: 'Optimize Furnace Atmosphere Makeup System' });
    });

    it('resets every section field to baseline and collapses sections when deselected', () => {
      state.toggleOpportunity(true);
      state.toggleSection('flowRate', 'atm-1', true);
      state.setModificationValue('atm-1', 'flowRate', 800);
      state.setModificationValue('atm-2', 'outletTemperature', 700);

      state.toggleOpportunity(false);

      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
      expect(effectiveLoss('atm-2').outletTemperature).toBe(900);
      expect(state.isExpanded('flowRate', 'atm-1')).toBe(false);
    });

    it('leaves fields no section owns untouched when resetting', () => {
      state.toggleOpportunity(true);
      state.setModificationValue('atm-1', 'flowRate', 800);
      overrideModificationLoss('atm-1', { specificHeat: 0.05 });

      state.toggleOpportunity(false);

      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
      expect(effectiveLoss('atm-1').specificHeat).toBe(0.05);
    });
  });

  describe('comparisons', () => {
    beforeEach(() => createState());

    it('pairs each baseline item with its modification item by id', () => {
      state.setModificationValue('atm-2', 'flowRate', 400);

      const comparison = state.comparisons()[1];
      expect(comparison.id).toBe('atm-2');
      expect(comparison.name).toBe('Atmosphere 2');
      expect(comparison.baseline.flowRate).toBe(500);
      expect(comparison.modification.flowRate).toBe(400);
      expect(comparison.modificationItem.flowRate).toBe(400);
    });
  });

  describe('sections', () => {
    beforeEach(() => {
      createState();
      state.toggleOpportunity(true);
    });

    it('starts collapsed when the modification matches baseline', () => {
      expect(state.isExpanded('flowRate', 'atm-1')).toBe(false);
      expect(state.isExpanded('temperature', 'atm-1')).toBe(false);
    });

    it('stays expanded after the value is typed back to baseline', () => {
      state.toggleSection('flowRate', 'atm-1', true);
      state.setModificationValue('atm-1', 'flowRate', 800);
      state.setModificationValue('atm-1', 'flowRate', 1000);

      expect(state.isExpanded('flowRate', 'atm-1')).toBe(true);
    });

    it('resets only that section of that loss when its checkbox is cleared', () => {
      state.toggleSection('flowRate', 'atm-1', true);
      state.toggleSection('temperature', 'atm-1', true);
      state.setModificationValue('atm-1', 'flowRate', 800);
      state.setModificationValue('atm-1', 'inletTemperature', 300);
      state.setModificationValue('atm-2', 'flowRate', 400);

      state.toggleSection('flowRate', 'atm-1', false);

      expect(state.isExpanded('flowRate', 'atm-1')).toBe(false);
      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
      expect(effectiveLoss('atm-1').inletTemperature).toBe(300);
      expect(effectiveLoss('atm-2').flowRate).toBe(400);
    });

    it('resets every field a multi-field section owns', () => {
      state.toggleSection('temperature', 'atm-1', true);
      state.setModificationValue('atm-1', 'inletTemperature', 300);
      state.setModificationValue('atm-1', 'outletTemperature', 1100);

      state.toggleSection('temperature', 'atm-1', false);

      expect(effectiveLoss('atm-1')).toEqual(jasmine.objectContaining({ inletTemperature: 100, outletTemperature: 1200 }));
    });
  });

  describe('writes', () => {
    beforeEach(() => createState());

    it('keeps another loss override when editing a different loss', () => {
      state.setModificationValue('atm-1', 'flowRate', 800);
      state.setModificationValue('atm-2', 'flowRate', 400);

      expect(effectiveLoss('atm-1').flowRate).toBe(800);
      expect(effectiveLoss('atm-2').flowRate).toBe(400);
    });

    it('ignores a NaN value from a cleared input', () => {
      state.setModificationValue('atm-1', 'flowRate', NaN);

      expect(effectiveLoss('atm-1').flowRate).toBe(1000);
    });
  });

  describe('section seeding', () => {
    it('opens sections that already differ from baseline', () => {
      overrideModificationLoss('atm-2', { outletTemperature: 700 });

      createState();

      expect(state.isExpanded('temperature', 'atm-2')).toBe(true);
      expect(state.isExpanded('flowRate', 'atm-2')).toBe(false);
      expect(state.isExpanded('temperature', 'atm-1')).toBe(false);
    });

    it('reseeds sections when switching to another modification', () => {
      createState();
      state.toggleSection('flowRate', 'atm-1', true);

      modificationService.addModification('Scenario 2');

      expect(state.isExpanded('flowRate', 'atm-1')).toBe(false);
    });
  });
});
