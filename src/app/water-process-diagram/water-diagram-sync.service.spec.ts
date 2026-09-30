import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WaterDiagramSyncService } from './water-diagram-sync.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { WaterAssessmentService } from '../water/water-assessment.service';
import { WaterProcessDiagramService } from './water-process-diagram.service';
import { UpdateAssessmentFromDiagramService } from '../water/update-assessment-from-diagram.service';
import { UpdateDiagramFromAssessmentService } from './update-diagram-from-assessment.service';
import { Diagram } from '../shared/models/diagram';
import { Assessment } from '../shared/models/assessment';

const makeDiagram = (id: number, nodeCount: number, assessmentId?: number): Diagram => ({
  id,
  assessmentId,
  waterDiagram: { flowDiagramData: { nodes: new Array(nodeCount).fill({}), edges: [] } }
} as unknown as Diagram);

const makeAssessment = (id: number, diagramId?: number): Assessment => ({ id, diagramId, water: { intakeSources: [] } } as unknown as Assessment);

describe('WaterDiagramSyncService', () => {
  let service: WaterDiagramSyncService;
  let writeLog: string[];
  let cacheLog: string[];
  let assessmentWriteLog: string[];
  let updateWithObservable: (diagram: Diagram) => Observable<Diagram>;
  let linkedDiagram: Diagram;
  let linkedAssessment: Assessment;
  let openDiagram: BehaviorSubject<Diagram>;
  let waterProcessDiagramService: { diagram: BehaviorSubject<Diagram>, remountDiagram: jasmine.Spy };
  let updateAssessmentFromDiagramService: jasmine.SpyObj<UpdateAssessmentFromDiagramService>;
  let updateDiagramFromAssessmentService: jasmine.SpyObj<UpdateDiagramFromAssessmentService>;

  beforeEach(() => {
    writeLog = [];
    cacheLog = [];
    assessmentWriteLog = [];
    linkedDiagram = makeDiagram(1, 1, 10);
    linkedAssessment = makeAssessment(10, 1);
    openDiagram = new BehaviorSubject<Diagram>(undefined);
    waterProcessDiagramService = { diagram: openDiagram, remountDiagram: jasmine.createSpy('remountDiagram') };
    updateWithObservable = (diagram: Diagram) => {
      writeLog.push(`write ${diagram.id}:${diagram.waterDiagram.flowDiagramData.nodes.length}`);
      return of(diagram);
    };
    updateAssessmentFromDiagramService = jasmine.createSpyObj('UpdateAssessmentFromDiagramService', ['applyDiagramToAssessment', 'saveAssessmentSettings']);
    updateAssessmentFromDiagramService.applyDiagramToAssessment.and.returnValue(false);
    updateAssessmentFromDiagramService.saveAssessmentSettings.and.resolveTo();
    updateDiagramFromAssessmentService = jasmine.createSpyObj('UpdateDiagramFromAssessmentService', ['addMissingNodesFromAssessment', 'setDiagramSettingsFromAssessment', 'updateDiagramFromAssessment']);
    updateDiagramFromAssessmentService.addMissingNodesFromAssessment.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: DiagramIdbService,
          useValue: {
            updateWithObservable: (diagram: Diagram) => updateWithObservable(diagram),
            upsertInCache: (diagram: Diagram) => cacheLog.push(`cache ${diagram.id}:${diagram.waterDiagram.flowDiagramData.nodes.length}`),
            findById: () => linkedDiagram
          }
        },
        {
          provide: AssessmentDbService,
          useValue: {
            updateWithObservable: (assessment: Assessment) => {
              assessmentWriteLog.push(`assessment ${assessment.id}`);
              return of(assessment);
            },
            upsertInCache: () => undefined,
            findById: () => linkedAssessment
          }
        },
        { provide: SettingsDbService, useValue: { getByAssessmentId: () => ({ unitsOfMeasure: 'Imperial' }) } },
        { provide: WaterAssessmentService, useValue: { assessmentValue: undefined } },
        { provide: WaterProcessDiagramService, useValue: waterProcessDiagramService },
        { provide: UpdateAssessmentFromDiagramService, useValue: updateAssessmentFromDiagramService },
        { provide: UpdateDiagramFromAssessmentService, useValue: updateDiagramFromAssessmentService },
      ]
    });
    service = TestBed.inject(WaterDiagramSyncService);
  });

  describe('saving diagrams', () => {
    it('runs overlapping saves one at a time, in request order', async () => {
      // * first write is slower than the second; without the queue the second would finish first
      updateWithObservable = (diagram: Diagram) => {
        const nodes = diagram.waterDiagram.flowDiagramData.nodes.length;
        writeLog.push(`start ${nodes}`);
        return of(diagram).pipe(delay(nodes === 1 ? 30 : 0));
      };
      await Promise.all([service.saveDiagram(makeDiagram(1, 1)), service.saveDiagram(makeDiagram(1, 2))]);
      expect(writeLog).toEqual(['start 1', 'start 2']);
      expect(cacheLog).toEqual(['cache 1:1', 'cache 1:2']);
    });

    it('updates the cache only after the write completes', async () => {
      await service.saveDiagram(makeDiagram(1, 1));
      expect(writeLog).toEqual(['write 1:1']);
      expect(cacheLog).toEqual(['cache 1:1']);
    });

    it('keeps processing after a failed save, and rejects only the failed one', async () => {
      updateWithObservable = (diagram: Diagram) => diagram.id === 1 ? throwError(() => new Error('write failed')) : of(diagram);
      const failed = service.saveDiagram(makeDiagram(1, 1));
      const succeeded = service.saveDiagram(makeDiagram(2, 1));
      await expectAsync(failed).toBeRejectedWithError('write failed');
      await succeeded;
      expect(cacheLog).toEqual(['cache 2:1']);
    });
  });

  describe('syncing the assessment from a saved diagram', () => {
    it('does not touch the assessment for a diagram with no linked assessment', async () => {
      await service.saveDiagram(makeDiagram(1, 1));
      await service.whenIdle();
      expect(updateAssessmentFromDiagramService.applyDiagramToAssessment).not.toHaveBeenCalled();
    });

    it('syncs once for a burst of saves', async () => {
      await Promise.all([service.saveDiagram(linkedDiagram), service.saveDiagram(linkedDiagram), service.saveDiagram(linkedDiagram)]);
      await service.whenIdle();
      expect(updateAssessmentFromDiagramService.applyDiagramToAssessment).toHaveBeenCalledTimes(1);
    });

    it('saves the assessment only when the sync changed it', async () => {
      await service.saveDiagram(linkedDiagram);
      await service.whenIdle();
      expect(assessmentWriteLog).toEqual([]);

      updateAssessmentFromDiagramService.applyDiagramToAssessment.and.callFake((_diagram, assessment) => {
        assessment.water.intakeSources = [{} as never];
        return false;
      });
      await service.saveDiagram(linkedDiagram);
      await service.whenIdle();
      expect(assessmentWriteLog).toEqual(['assessment 10']);
    });

    it('saves settings only when the unit settings changed', async () => {
      await service.saveDiagram(linkedDiagram);
      await service.whenIdle();
      expect(updateAssessmentFromDiagramService.saveAssessmentSettings).not.toHaveBeenCalled();

      updateAssessmentFromDiagramService.applyDiagramToAssessment.and.returnValue(true);
      await service.saveDiagram(linkedDiagram);
      await service.whenIdle();
      expect(updateAssessmentFromDiagramService.saveAssessmentSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('notifying open assessment forms', () => {
    it('emits the assessment when a diagram sync changed it', async () => {
      const synced: Assessment[] = [];
      service.assessmentSyncedFromDiagram.subscribe((assessment) => synced.push(assessment));
      updateAssessmentFromDiagramService.applyDiagramToAssessment.and.callFake((_diagram, assessment) => {
        assessment.water.intakeSources = [{} as never];
        return false;
      });
      await service.saveDiagram(linkedDiagram);
      await service.whenIdle();
      expect(synced).toEqual([linkedAssessment]);
    });

    it('does not emit when the sync changed nothing', async () => {
      const synced: Assessment[] = [];
      service.assessmentSyncedFromDiagram.subscribe((assessment) => synced.push(assessment));
      await service.saveDiagram(linkedDiagram);
      await service.whenIdle();
      expect(synced).toEqual([]);
    });
  });

  describe('syncing the diagram from an edited assessment', () => {
    it('saves the assessment and marks the diagram stale when the refresh changed it', async () => {
      updateDiagramFromAssessmentService.updateDiagramFromAssessment.and.callFake((diagram) => {
        diagram.waterDiagram.flowDiagramData.nodes.push({ id: 'added' } as never);
      });
      await service.assessmentChanged(linkedAssessment);
      await service.whenIdle();
      expect(assessmentWriteLog).toEqual(['assessment 10']);
      expect(writeLog).toEqual(['write 1:2']);

      service.remountDiagramIfStale();
      service.remountDiagramIfStale();
      expect(waterProcessDiagramService.remountDiagram).toHaveBeenCalledTimes(1);
    });

    it('leaves the diagram and its mount alone when the refresh changed nothing', async () => {
      await service.assessmentChanged(linkedAssessment);
      await service.whenIdle();
      expect(writeLog).toEqual([]);
      service.remountDiagramIfStale();
      expect(waterProcessDiagramService.remountDiagram).not.toHaveBeenCalled();
    });

    it('refreshes the diagram once for a burst of assessment edits', async () => {
      await Promise.all([service.assessmentChanged(linkedAssessment), service.assessmentChanged(linkedAssessment), service.assessmentChanged(linkedAssessment)]);
      await service.whenIdle();
      expect(updateDiagramFromAssessmentService.updateDiagramFromAssessment).toHaveBeenCalledTimes(1);
      expect(assessmentWriteLog.length).toBe(3);
    });

    it('prefers the diagram a component has open over the cached copy', async () => {
      const openLinkedDiagram = makeDiagram(1, 1, 10);
      openDiagram.next(openLinkedDiagram);
      updateDiagramFromAssessmentService.updateDiagramFromAssessment.and.callFake((diagram) => {
        diagram.waterDiagram.flowDiagramData.nodes.push({ id: 'added' } as never);
      });
      await service.assessmentChanged(linkedAssessment);
      await service.whenIdle();
      expect(openLinkedDiagram.waterDiagram.flowDiagramData.nodes.length).toBe(2);
      expect(linkedDiagram.waterDiagram.flowDiagramData.nodes.length).toBe(1);
    });
  });

  describe('reconciling when an assessment opens', () => {
    it('writes nothing when the diagram and assessment already agree', async () => {
      await service.reconcileWithDiagram(linkedAssessment);
      expect(writeLog).toEqual([]);
      expect(assessmentWriteLog).toEqual([]);
    });

    it('saves the diagram when nodes were added for assessment-only components', async () => {
      updateDiagramFromAssessmentService.addMissingNodesFromAssessment.and.returnValue(true);
      await service.reconcileWithDiagram(linkedAssessment);
      expect(writeLog).toEqual(['write 1:1']);
    });
  });

  describe('whenIdle', () => {
    it('resolves after every queued task has finished', async () => {
      updateWithObservable = (diagram: Diagram) => of(diagram).pipe(delay(20));
      let isSaveDone = false;
      service.saveDiagram(makeDiagram(1, 1)).then(() => isSaveDone = true);
      await service.whenIdle();
      expect(isSaveDone).toBeTrue();
    });
  });
});
