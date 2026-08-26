import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PHAST } from '../../shared/models/phast/phast';
import { ScenarioOverrides, ProcessHeatingModification } from '../models/modification';
import { ModificationService } from './modification.service';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingUiService } from './process-heating-ui.service';

class FakeProcessHeatingAssessmentService {
  readonly processHeatingSignal: WritableSignal<PHAST> = signal<PHAST>({ name: 'Baseline', modifications: [] });

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
}

class FakeProcessHeatingUiService {
  activeModificationIdSignal: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
}

describe('ModificationService', () => {
  let service: ModificationService;
  let uiService: FakeProcessHeatingUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useClass: FakeProcessHeatingAssessmentService },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
      ],
    });
    service = TestBed.inject(ModificationService);
    uiService = TestBed.inject(ProcessHeatingUiService) as unknown as FakeProcessHeatingUiService;
  });

  it('starts with no modifications and no selection', () => {
    expect(service.modifications()).toEqual([]);
    expect(service.selectedModificationId()).toBeUndefined();
    expect(service.selectedModification()).toBeUndefined();
  });

  it('adds a modification with an incrementing default name, auto-selecting it', () => {
    const firstId = service.addModification();
    expect(service.selectedModificationId()).toBe(firstId);
    expect(service.selectedModification()?.scenarioOverrides?.name).toBe('Scenario 1');

    const secondId = service.addModification();
    expect(service.modifications().length).toBe(2);
    expect(service.modifications().find((modification: ProcessHeatingModification) => modification.id === secondId)?.scenarioOverrides?.name).toBe('Scenario 2');
  });

  it('falls back to selecting the first modification when nothing is explicitly selected', () => {
    const firstId = service.addModification('First');
    service.addModification('Second');
    uiService.activeModificationIdSignal.set(undefined);

    expect(service.selectedModificationId()).toBe(firstId);
  });

  it('copies a modification with a new id, a "copy" suffixed name, and its existing data, then selects the copy', () => {
    const originalId = service.addModification('Original');

    const copyId = service.copyModification(originalId);

    expect(copyId).toBeDefined();
    expect(copyId).not.toBe(originalId);
    expect(service.selectedModificationId()).toBe(copyId);
    const copy = service.modifications().find((modification: ProcessHeatingModification) => modification.id === copyId);
    expect(copy?.scenarioOverrides?.name).toBe('Original copy');
    // original is untouched
    expect(service.modifications().find((modification: ProcessHeatingModification) => modification.id === originalId)?.scenarioOverrides?.name).toBe('Original');
  });

  it('returns undefined and makes no change when copying a modification that does not exist', () => {
    expect(service.copyModification('missing-id')).toBeUndefined();
    expect(service.modifications()).toEqual([]);
  });

  it('renames a modification by writing its scenarioOverrides.name', () => {
    const id = service.addModification('Original Name');
    service.renameModification(id, 'Renamed');
    expect(service.modifications().find((modification: ProcessHeatingModification) => modification.id === id)?.scenarioOverrides?.name).toBe('Renamed');
  });

  it('deletes a modification', () => {
    const id = service.addModification();
    service.deleteModification(id);
    expect(service.modifications()).toEqual([]);
  });

  it('selects the next remaining modification when the deleted one was selected', () => {
    const firstId = service.addModification('First');
    const secondId = service.addModification('Second');
    service.selectModification(firstId);

    service.deleteModification(firstId);

    expect(service.selectedModificationId()).toBe(secondId);
  });

  it('leaves selection untouched when deleting a modification that is not the selected one', () => {
    const firstId = service.addModification('First');
    const secondId = service.addModification('Second');
    service.selectModification(firstId);

    service.deleteModification(secondId);

    expect(service.selectedModificationId()).toBe(firstId);
  });
});
