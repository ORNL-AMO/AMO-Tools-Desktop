import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../shared/models/settings';
import { AuxiliaryEquipmentResults } from '../models/auxiliary-equipment';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { AuxiliaryEquipmentResultsService } from '../services/auxiliary-equipment-results.service';
import { AuxiliaryEquipmentFormService, newAuxiliaryEquipmentItem } from './auxiliary-equipment-form.service';
import { AuxiliaryEquipmentComponent } from './auxiliary-equipment.component';
import { AuxiliaryEquipmentFormItem, AuxiliaryEquipmentService } from './auxiliary-equipment.service';

describe('AuxiliaryEquipmentComponent', () => {
  let fixture: ComponentFixture<AuxiliaryEquipmentComponent>;
  let service: jasmine.SpyObj<AuxiliaryEquipmentService>;
  let equipment: WritableSignal<AuxiliaryEquipmentFormItem[]>;
  let results: WritableSignal<AuxiliaryEquipmentResults>;
  let scenarioResults: jasmine.Spy;
  let formService: AuxiliaryEquipmentFormService;

  const element = (): HTMLElement => fixture.nativeElement;
  const makeItem = (id: string, name: string): AuxiliaryEquipmentFormItem =>
    ({ id, name, collapse: false, heatLoss: null, form: formService.getForm(newAuxiliaryEquipmentItem(8760, true)) });
  const resultsWith = (...items: Array<{ id: string; energyUse: number }>): AuxiliaryEquipmentResults => ({
    items: items.map(item => ({ ...item, name: item.id, power: 1, energyCost: 0 })),
    totalPower: items.length,
    totalEnergyUse: items.reduce((total, item) => total + item.energyUse, 0),
    totalEnergyCost: 0,
  });

  beforeEach(async () => {
    equipment = signal<AuxiliaryEquipmentFormItem[]>([]);
    results = signal(resultsWith());
    scenarioResults = jasmine.createSpy('scenarioResults').and.callFake(() => results());
    service = jasmine.createSpyObj('AuxiliaryEquipmentService', ['initialize', 'add', 'remove', 'setName', 'toggleCollapse', 'differingFields'], { equipment });

    await TestBed.configureTestingModule({
      declarations: [AuxiliaryEquipmentComponent],
      providers: [
        AuxiliaryEquipmentFormService,
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: signal({ unitsOfMeasure: 'Imperial' } as Settings) } },
        { provide: AuxiliaryEquipmentResultsService, useValue: { scenarioResults } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    TestBed.overrideComponent(AuxiliaryEquipmentComponent, { set: { providers: [{ provide: AuxiliaryEquipmentService, useValue: service }] } });
    formService = TestBed.inject(AuxiliaryEquipmentFormService);

    fixture = TestBed.createComponent(AuxiliaryEquipmentComponent);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('loads baseline equipment by default and reloads equipment and results when the scenario changes', () => {
      expect(service.initialize).toHaveBeenCalledWith('baseline');

      equipment.set([makeItem('aux-1', 'Fan')]);
      fixture.componentRef.setInput('scenario', 'mod-1');
      fixture.detectChanges();

      expect(service.initialize).toHaveBeenCalledWith('mod-1');
      expect(scenarioResults).toHaveBeenCalledWith('mod-1');
    });
  });

  describe('user actions', () => {
    it('adds, removes, renames, and collapses equipment through the service', () => {
      equipment.set([makeItem('aux-1', 'Fan')]);
      fixture.detectChanges();

      (element().querySelector('.btn-primary') as HTMLButtonElement).click();
      (element().querySelector('.text-danger') as HTMLButtonElement).click();
      (element().querySelector('.card-header .btn-link') as HTMLButtonElement).click();
      const name = element().querySelector('.loss-name-input') as HTMLInputElement;
      name.value = 'Blower';
      name.dispatchEvent(new Event('input'));

      expect(service.add).toHaveBeenCalled();
      expect(service.remove).toHaveBeenCalledWith('aux-1');
      expect(service.toggleCollapse).toHaveBeenCalledWith('aux-1');
      expect(service.setName).toHaveBeenCalledWith('aux-1', 'Blower');
    });
  });

  describe('rendering', () => {
    it('shows the empty state without equipment', () => {
      expect(element().querySelector('.no-data')).not.toBeNull();
      expect(element().querySelector('.card')).toBeNull();
    });

    it('shows each item energy, a placeholder for an item without results, and totals only for several items', () => {
      equipment.set([makeItem('aux-1', 'Fan')]);
      results.set(resultsWith({ id: 'aux-1', energyUse: 1200 }));
      fixture.detectChanges();

      expect(element().querySelector('.loss-results').textContent).toContain('1,200 kWh/yr');
      expect(element().querySelector('.result-totals')).toBeNull();

      equipment.set([makeItem('aux-1', 'Fan'), makeItem('aux-2', 'Pump')]);
      fixture.detectChanges();

      expect(element().querySelectorAll('.loss-results')[1].textContent).toContain('——');
      expect(element().querySelector('.result-totals').textContent).toContain('1,200 kWh/yr');
    });

    it('hides the form of a collapsed item', () => {
      equipment.set([{ ...makeItem('aux-1', 'Fan'), collapse: true }]);
      fixture.detectChanges();

      expect(element().querySelector('app-auxiliary-equipment-form')).toBeNull();
    });
  });
});
