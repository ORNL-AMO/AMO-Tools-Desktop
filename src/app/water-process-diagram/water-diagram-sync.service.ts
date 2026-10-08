import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import * as _ from 'lodash';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Diagram } from '../shared/models/diagram';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { WaterAssessmentService } from '../water/water-assessment.service';
import { UpdateAssessmentFromDiagramService } from '../water/update-assessment-from-diagram.service';
import { UpdateDiagramFromAssessmentService } from './update-diagram-from-assessment.service';
import { WaterProcessDiagramService } from './water-process-diagram.service';

/**
 * Single ordered path for persisting a water diagram and its linked assessment. Every write and sync runs
 * one at a time in the order requested, so overlapping saves can no longer land out of order, and neither
 * side is rebuilt from a stale copy of the other.
 *
 * Directions:
 * - diagram saved -> assessment components, flows and settings are rewritten from the diagram
 * - assessment edited -> diagram nodes are refreshed from the assessment components, and the diagram is
 *   marked stale so it re-mounts (re-hydrates its store) the next time the diagram tab is shown
 */
@Injectable({
  providedIn: 'root'
})
export class WaterDiagramSyncService {
  private readonly diagramIdbService = inject(DiagramIdbService);
  private readonly assessmentDbService = inject(AssessmentDbService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly waterAssessmentService = inject(WaterAssessmentService);
  private readonly waterProcessDiagramService = inject(WaterProcessDiagramService);
  private readonly updateAssessmentFromDiagramService = inject(UpdateAssessmentFromDiagramService);
  private readonly updateDiagramFromAssessmentService = inject(UpdateDiagramFromAssessmentService);

  // * emits after a diagram sync changed an assessment in place, so open assessment forms can refresh
  readonly assessmentSyncedFromDiagram = new Subject<Assessment>();

  private lastTask: Promise<void> = Promise.resolve();
  private pendingTasks: number = 0;
  
  // * a queued sync reads the latest state when it runs, so requests made for the same record while one is waiting are already covered
  private pendingAssessmentSyncs = new Map<number, Diagram>();
  private pendingDiagramSyncs = new Map<number, Assessment>();
  private isDiagramStale: boolean = false;

  // * records whose latest write failed. A dependent sync is skipped so the linked record is not rebuilt from data that never saved
  private unsavedDiagramIds = new Set<number>();
  private unsavedAssessmentIds = new Set<number>();

  saveDiagram(diagram: Diagram): Promise<void> {
    const thisSave = this.enqueue(() => this.persistDiagram(diagram));
    if (diagram.assessmentId !== undefined) {
      this.queueAssessmentSync(diagram);
    }
    return thisSave;
  }

  saveAssessment(assessment: Assessment): Promise<void> {
    return this.enqueue(() => this.persistAssessment(assessment));
  }

  assessmentChanged(assessment: Assessment): Promise<void> {
    const thisSave = this.saveAssessment(assessment);
    if (assessment.diagramId !== undefined) {
      this.queueDiagramSync(assessment);
    }
    return thisSave;
  }

  /**
   * Run when an assessment opens: adds nodes for any assessment component the diagram lacks, then rewrites the
   * assessment from the diagram, so both start from the same components. Writes only what changed.
   */
  reconcileWithDiagram(assessment: Assessment): Promise<void> {
    return this.enqueue(async () => {
      this.isDiagramStale = false;
      const diagram = this.getLinkedDiagram(assessment.diagramId);
      if (!diagram) {
        return;
      }
      if (this.updateDiagramFromAssessmentService.addMissingNodesFromAssessment(diagram, assessment.water)) {
        await this.persistDiagram(diagram);
      }
      await this.syncAssessmentFromDiagram(diagram, assessment);
    });
  }

  remountDiagramIfStale() {
    if (this.isDiagramStale) {
      this.isDiagramStale = false;
      this.waterProcessDiagramService.remountDiagram();
    }
  }

  /** Emits any save the diagram web component is still debouncing, so it is queued before waiting on {@link whenIdle}. */
  flushDiagram() {
    this.waterProcessDiagramService.flushPendingSave?.();
  }

  async whenIdle(): Promise<void> {
    while (this.pendingTasks > 0) {
      await this.lastTask;
    }
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    this.pendingTasks++;
    const thisTask = this.lastTask.then(task).finally(() => this.pendingTasks--);
    // * a failed task must not block later tasks
    this.lastTask = thisTask.catch(() => undefined);
    return thisTask;
  }

  private queueAssessmentSync(diagram: Diagram) {
    const isQueued = this.pendingAssessmentSyncs.has(diagram.assessmentId);
    this.pendingAssessmentSyncs.set(diagram.assessmentId, diagram);
    if (isQueued) {
      return;
    }
    this.enqueue(async () => {
      const latestDiagram = this.pendingAssessmentSyncs.get(diagram.assessmentId);
      this.pendingAssessmentSyncs.delete(diagram.assessmentId);
      const assessment = this.getLinkedAssessment(latestDiagram.assessmentId);
      if (this.unsavedDiagramIds.has(latestDiagram.id)) {
        console.error('Skipped assessment sync, diagram write failed', latestDiagram.id);
        return;
      }
      if (assessment) {
        await this.syncAssessmentFromDiagram(latestDiagram, assessment);
      }
    }).catch((error) => console.error('Water diagram to assessment sync failed', error));
  }

  private queueDiagramSync(assessment: Assessment) {
    const isQueued = this.pendingDiagramSyncs.has(assessment.id);
    this.pendingDiagramSyncs.set(assessment.id, assessment);
    if (isQueued) {
      return;
    }
    this.enqueue(async () => {
      const latestAssessment = this.pendingDiagramSyncs.get(assessment.id);
      this.pendingDiagramSyncs.delete(assessment.id);
      if (this.unsavedAssessmentIds.has(latestAssessment.id)) {
        console.error('Skipped diagram sync, assessment write failed', latestAssessment.id);
        return;
      }
      await this.syncDiagramFromAssessment(latestAssessment);
    }).catch((error) => console.error('Water assessment to diagram sync failed', error));
  }

  private async syncAssessmentFromDiagram(diagram: Diagram, assessment: Assessment) {
    const settings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
    if (!settings) {
      return;
    }
    const waterBefore = _.cloneDeep(assessment.water);
    // * the live diagram holds the frozen state the diagram store emitted, and assessment components are edited in place
    const areSettingsChanged = this.updateAssessmentFromDiagramService.applyDiagramToAssessment(_.cloneDeep(diagram), assessment, settings);
    if (areSettingsChanged) {
      await this.updateAssessmentFromDiagramService.saveAssessmentSettings(settings);
    }
    if (!_.isEqual(waterBefore, assessment.water)) {
      await this.persistAssessment(assessment);
      this.assessmentSyncedFromDiagram.next(assessment);
    }
  }

  private async syncDiagramFromAssessment(assessment: Assessment) {
    const diagram = this.getLinkedDiagram(assessment.diagramId);
    if (!diagram) {
      return;
    }
    const refreshedDiagram: Diagram = _.cloneDeep(diagram);
    const settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    this.updateDiagramFromAssessmentService.setDiagramSettingsFromAssessment(assessment, settings, refreshedDiagram);
    this.updateDiagramFromAssessmentService.updateDiagramFromAssessment(refreshedDiagram, assessment.water);
    if (_.isEqual(refreshedDiagram.waterDiagram.flowDiagramData, diagram.waterDiagram.flowDiagramData)) {
      return;
    }
    diagram.waterDiagram.flowDiagramData = refreshedDiagram.waterDiagram.flowDiagramData;
    this.isDiagramStale = true;
    await this.persistDiagram(diagram);
  }

  private async persistDiagram(diagram: Diagram) {
    try {
      await firstValueFrom(this.diagramIdbService.updateWithObservable(diagram));
    } catch (error) {
      this.unsavedDiagramIds.add(diagram.id);
      throw error;
    }
    this.unsavedDiagramIds.delete(diagram.id);
    this.diagramIdbService.upsertInCache(diagram);
  }

  private async persistAssessment(assessment: Assessment) {
    try {
      await firstValueFrom(this.assessmentDbService.updateWithObservable(assessment));
    } catch (error) {
      this.unsavedAssessmentIds.add(assessment.id);
      throw error;
    }
    this.unsavedAssessmentIds.delete(assessment.id);
    this.assessmentDbService.upsertInCache(assessment);
  }

  // * prefer the objects a component is editing over cached copies
  private getLinkedDiagram(diagramId: number): Diagram {
    const openDiagram = this.waterProcessDiagramService.diagram.getValue();
    return openDiagram?.id === diagramId ? openDiagram : this.diagramIdbService.findById(diagramId);
  }

  private getLinkedAssessment(assessmentId: number): Assessment {
    const openAssessment = this.waterAssessmentService.assessmentValue;
    return openAssessment?.id === assessmentId ? openAssessment : this.assessmentDbService.findById(assessmentId);
  }
}
