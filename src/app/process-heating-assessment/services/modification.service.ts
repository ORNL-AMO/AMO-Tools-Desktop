import { computed, inject, Injectable, Signal } from '@angular/core';
import { getNewIdString } from '../../shared/helperFunctions';
import { Modification } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingUiService } from './process-heating-ui.service';

@Injectable()
export class ModificationService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly modifications: Signal<ProcessHeatingModification[]> = computed(() =>
    this.assessmentService.processHeatingSignal()?.modifications ?? []
  );

  readonly selectedModificationId: Signal<string | undefined> = computed(() => {
    const modifications = this.modifications();
    const activeId = this.uiService.activeModificationIdSignal();
    if (activeId && modifications.some(modification => modification.id === activeId)) {
      return activeId;
    }
    return modifications[0]?.id;
  });

  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = computed(() =>
    this.modifications().find(modification => modification.id === this.selectedModificationId())
  );

  selectModification(id: string): void {
    this.uiService.activeModificationIdSignal.set(id);
  }

  addModification(name?: string): string {
    const modifications = this.modifications();
    const id = getNewIdString();
    const modificationName = name ?? this.defaultModificationName();
    const modification: ProcessHeatingModification = { id, scenarioOverrides: { name: modificationName } };
    this.writeModifications([...modifications, modification]);
    this.selectModification(id);
    return id;
  }

  // Single source for the "next scenario" default name, so dialog callers (Explore Opportunities,
  // Expert View) don't each hand-compute the same formula.
  defaultModificationName(): string {
    return `Scenario ${this.modifications().length + 1}`;
  }

  copyModification(id: string): string | undefined {
    const source = this.modifications().find(modification => modification.id === id);
    if (!source) {
      return undefined;
    }
    const newId = getNewIdString();
    const copyName = `${source.scenarioOverrides?.name ?? 'Scenario'} copy`;
    const copy: ProcessHeatingModification = { ...source, id: newId, scenarioOverrides: { ...source.scenarioOverrides, name: copyName } };
    this.writeModifications([...this.modifications(), copy]);
    this.selectModification(newId);
    return newId;
  }

  renameModification(id: string, name: string): void {
    this.assessmentService.updateModificationProperty(id, 'name', name);
  }

  setExploreOpportunityFlag<K extends keyof Modification>(id: string, key: K, value: Modification[K]): void {
    const updated = this.modifications().map(modification =>
      modification.id === id ? { ...modification, [key]: value } : modification
    );
    this.writeModifications(updated);
  }

  deleteModification(id: string): void {
    const remaining = this.modifications().filter(modification => modification.id !== id);
    this.writeModifications(remaining);
    if (this.uiService.activeModificationIdSignal() === id) {
      this.uiService.activeModificationIdSignal.set(remaining[0]?.id);
    }
  }

  private writeModifications(modifications: ProcessHeatingModification[]): void {
    this.assessmentService.updateProcessHeatingProperty('modifications', modifications);
  }
}
