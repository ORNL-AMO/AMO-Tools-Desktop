import { UpdateAssessmentFromDiagramService } from './update-assessment-from-diagram.service';
import { Diagram } from '../shared/models/diagram';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';

const makeDiagram = (unitsOfMeasure: string, flowDecimalPrecision: number): Diagram => ({
  waterDiagram: {
    flowDiagramData: {
      nodes: [],
      edges: [],
      calculatedData: { nodes: {} },
      diagramNotes: 'diagram notes',
      settings: { unitsOfMeasure, flowDecimalPrecision, electricityCost: 0.12, conductivityUnit: 'uS' }
    }
  }
} as unknown as Diagram);

const makeAssessment = (): Assessment => ({
  water: { systemBasics: { electricityCost: 0.05, conductivityUnit: 'mS', notes: '' }, waterUsingSystems: [] }
} as unknown as Assessment);

const makeSettings = (unitsOfMeasure: string, flowDecimalPrecision: number): Settings => ({ unitsOfMeasure, flowDecimalPrecision } as Settings);

describe('UpdateAssessmentFromDiagramService', () => {
  let service: UpdateAssessmentFromDiagramService;

  beforeEach(() => {
    service = new UpdateAssessmentFromDiagramService(null, null, null, null, null, null, null);
  });

  describe('setAssessmentSettingsFromDiagram', () => {
    it('reports a change when units of measure differ', () => {
      const settings = makeSettings('Imperial', 2);
      expect(service.setAssessmentSettingsFromDiagram(makeAssessment(), settings, makeDiagram('Metric', 2))).toBeTrue();
      expect(settings.unitsOfMeasure).toBe('Metric');
    });

    it('reports a change when flow decimal precision differs', () => {
      const settings = makeSettings('Imperial', 2);
      expect(service.setAssessmentSettingsFromDiagram(makeAssessment(), settings, makeDiagram('Imperial', 3))).toBeTrue();
      expect(settings.flowDecimalPrecision).toBe(3);
    });

    it('reports no change when both settings already match', () => {
      const settings = makeSettings('Imperial', 2);
      expect(service.setAssessmentSettingsFromDiagram(makeAssessment(), settings, makeDiagram('Imperial', 2))).toBeFalse();
    });

    it('copies cost, conductivity unit and notes onto the assessment regardless of the result', () => {
      const assessment = makeAssessment();
      service.setAssessmentSettingsFromDiagram(assessment, makeSettings('Imperial', 2), makeDiagram('Imperial', 2));
      expect(assessment.water.systemBasics.electricityCost).toBe(0.12);
      expect(assessment.water.systemBasics.conductivityUnit).toBe('uS');
      expect(assessment.water.systemBasics.notes).toBe('diagram notes');
    });
  });

  describe('applyDiagramToAssessment', () => {
    beforeEach(() => {
      spyOn(service, 'updateAssessmentWaterComponents');
    });

    it('returns true when the diagram changed the unit settings', () => {
      expect(service.applyDiagramToAssessment(makeDiagram('Metric', 2), makeAssessment(), makeSettings('Imperial', 2))).toBeTrue();
    });

    it('returns false when the unit settings already match', () => {
      expect(service.applyDiagramToAssessment(makeDiagram('Imperial', 2), makeAssessment(), makeSettings('Imperial', 2))).toBeFalse();
    });
  });
});
