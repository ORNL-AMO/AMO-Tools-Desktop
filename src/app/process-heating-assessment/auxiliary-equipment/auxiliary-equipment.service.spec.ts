import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { AuxiliaryEquipmentResultsService } from '../services/auxiliary-equipment-results.service';
import { AuxiliaryEquipmentFormService, newAuxiliaryEquipmentItem } from './auxiliary-equipment-form.service';
import { AuxiliaryEquipmentService } from './auxiliary-equipment.service';

describe('AuxiliaryEquipmentService', () => {
  let service: AuxiliaryEquipmentService;
  let scenarios: Record<string, WritableSignal<PHAST>>;
  let updateProcessHeatingProperty: jasmine.Spy;
  let updateModificationProperty: jasmine.Spy;
  let modifications: ProcessHeatingModification[];

  const saved = (id: string, name: string): AuxiliaryEquipmentItem => ({ ...newAuxiliaryEquipmentItem(8760, true), id, name });

  beforeEach(() => {
    scenarios = {
      baseline: signal<PHAST>({ operatingHours: { hoursPerYear: 6000 } as never, auxiliaryEquipment: [saved('aux-1', 'Fan')] }),
      'mod-1': signal<PHAST>({ auxiliaryEquipment: [{ ...saved('aux-1', 'Fan'), operatingHours: 4000 }] }),
    };
    updateProcessHeatingProperty = jasmine.createSpy('updateProcessHeatingProperty');
    updateModificationProperty = jasmine.createSpy('updateModificationProperty');
    modifications = [{ id: 'mod-1', scenarioOverrides: { auxiliaryEquipment: scenarios['mod-1']().auxiliaryEquipment } }];

    TestBed.configureTestingModule({
      providers: [
        AuxiliaryEquipmentService,
        AuxiliaryEquipmentFormService,
        { provide: AuxiliaryEquipmentResultsService, useValue: { getResults: () => ({ totalPower: 7 }) } },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal({ unitsOfMeasure: 'Imperial' } as Settings),
            scenarioPhastSignal: (scenario: string) => scenarios[scenario](),
            processHeatingSignal: () => ({}),
            getModifications: () => modifications,
            updateProcessHeatingProperty,
            updateModificationProperty,
          },
        },
      ],
    });
    service = TestBed.inject(AuxiliaryEquipmentService);
  });

  it('loads the scenario equipment with each item power', () => {
    service.initialize('baseline');

    expect(service.equipment().map(item => [item.id, item.name, item.heatLoss])).toEqual([['aux-1', 'Fan', 7]]);
  });

  it('adds a numbered item running for the scenario hours and saves baseline equipment without the power', () => {
    service.initialize('baseline');
    service.add();

    const [equipment] = updateProcessHeatingProperty.calls.mostRecent().args.slice(1);
    expect(updateProcessHeatingProperty.calls.mostRecent().args[0]).toBe('auxiliaryEquipment');
    expect(equipment[1].name).toBe('Equipment #2');
    expect(equipment[1].operatingHours).toBe(6000);
    expect(equipment.every((item: object) => !('heatLoss' in item))).toBeTrue();
  });

  it('saves a modification edit to that modification only', () => {
    service.initialize('mod-1');
    service.equipment()[0].form.controls.units.setValue(2);

    expect(updateProcessHeatingProperty).not.toHaveBeenCalled();
    const [modificationId, key, equipment] = updateModificationProperty.calls.mostRecent().args;
    expect([modificationId, key]).toEqual(['mod-1', 'auxiliaryEquipment']);
    expect(equipment[0].units).toBe(2);
  });

  it('gives a modification still following baseline its own copy of the items once shown', () => {
    modifications = [{ id: 'mod-1', scenarioOverrides: {} }];
    service.initialize('mod-1');

    const [modificationId, key, equipment] = updateModificationProperty.calls.mostRecent().args;
    expect([modificationId, key]).toEqual(['mod-1', 'auxiliaryEquipment']);
    expect(equipment.map((item: AuxiliaryEquipmentItem) => item.id)).toEqual(['aux-1']);
  });

  it('gives a modification its own empty list when baseline has no items, so later baseline items stay out of it', () => {
    scenarios['mod-1'].set({ auxiliaryEquipment: undefined });
    modifications = [{ id: 'mod-1', scenarioOverrides: {} }];
    service.initialize('mod-1');

    expect(updateModificationProperty).toHaveBeenCalledOnceWith('mod-1', 'auxiliaryEquipment', []);
  });

  it('leaves a modification with its own items unchanged when shown', () => {
    service.initialize('mod-1');
    expect(updateModificationProperty).not.toHaveBeenCalled();
  });

  it('flags the modification fields that differ from baseline', () => {
    service.initialize('mod-1');

    expect([...service.differingFields('aux-1')]).toEqual(['operatingHours']);
  });
});
