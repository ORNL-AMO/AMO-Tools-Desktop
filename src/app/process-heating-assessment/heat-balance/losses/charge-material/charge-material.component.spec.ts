import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ChargeMaterialComponent } from './charge-material.component';
import { ChargeMaterialItem, ChargeMaterialService, GasChargeMaterialItem, LiquidChargeMaterialItem, SolidChargeMaterialItem } from './charge-material.service';
import { ChargeMaterialType } from '../../../models/charge-material';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import { SolidMaterialFormService } from './solid-form/solid-material-form.service';
import { LiquidMaterialFormService } from './liquid-form/liquid-material-form.service';
import { GasMaterialFormService } from './gas-form/gas-material-form.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeSolidItem(formService: SolidMaterialFormService, id: string, name: string): SolidChargeMaterialItem {
  return { id, name, type: ChargeMaterialType.Solid, form: formService.getSolidChargeMaterialForm({}) };
}

function makeLiquidItem(formService: LiquidMaterialFormService, id: string, name: string): LiquidChargeMaterialItem {
  return { id, name, type: ChargeMaterialType.Liquid, form: formService.getLiquidChargeMaterialForm({}) };
}

function makeGasItem(formService: GasMaterialFormService, id: string, name: string): GasChargeMaterialItem {
  return { id, name, type: ChargeMaterialType.Gas, form: formService.getGasChargeMaterialForm({}) };
}

describe('ChargeMaterialComponent', () => {
  let component: ChargeMaterialComponent;
  let fixture: ComponentFixture<ChargeMaterialComponent>;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let chargeMaterialServiceSpy: jasmine.SpyObj<ChargeMaterialService>;
  let settingsSignal: WritableSignal<Settings>;
  let materialsSignal: WritableSignal<ChargeMaterialItem[]>;
  let materialResultTotalsSignal: WritableSignal<{ heatRequired: number; netHeatLoss: number; endoExoHeat: number }>;
  let isMaterialAdditionLockedSignal: WritableSignal<boolean>;
  let collapsedIdsSignal: WritableSignal<ReadonlySet<string>>;
  let solidItem: SolidChargeMaterialItem;
  let liquidItem: LiquidChargeMaterialItem;
  let gasItem: GasChargeMaterialItem;

  beforeEach(async () => {
    settingsSignal = signal(MOCK_SETTINGS);
    assessmentServiceSpy = jasmine.createSpyObj('ProcessHeatingAssessmentService', [], {
      settingsSignal,
    });

    materialsSignal = signal<ChargeMaterialItem[]>([]);
    materialResultTotalsSignal = signal({ heatRequired: 0, netHeatLoss: 0, endoExoHeat: 0 });
    isMaterialAdditionLockedSignal = signal(false);
    collapsedIdsSignal = signal(new Set<string>());

    chargeMaterialServiceSpy = jasmine.createSpyObj(
      'ChargeMaterialService',
      ['initialize', 'setName', 'switchType', 'add', 'remove', 'toggleCollapse'],
      {
        materials: materialsSignal,
        results: signal(new Map()),
        materialResultTotals: materialResultTotalsSignal,
        isMaterialAdditionLocked: isMaterialAdditionLockedSignal,
        collapsedIds: collapsedIdsSignal,
      },
    );

    await TestBed.configureTestingModule({
      declarations: [ChargeMaterialComponent],
      imports: [DecimalPipe],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: assessmentServiceSpy },
        SolidMaterialFormService,
        LiquidMaterialFormService,
        GasMaterialFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    TestBed.overrideComponent(ChargeMaterialComponent, {
      set: { providers: [{ provide: ChargeMaterialService, useValue: chargeMaterialServiceSpy }] },
    });

    solidItem = makeSolidItem(TestBed.inject(SolidMaterialFormService), 'solid-1', 'Solid Material');
    liquidItem = makeLiquidItem(TestBed.inject(LiquidMaterialFormService), 'liquid-1', 'Liquid Material');
    gasItem = makeGasItem(TestBed.inject(GasMaterialFormService), 'gas-1', 'Gas Material');

    fixture = TestBed.createComponent(ChargeMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('initializes the charge material service with the default baseline scenario', () => {
      expect(chargeMaterialServiceSpy.initialize).toHaveBeenCalledWith('baseline');
    });

    it('initializes the charge material service with a modification scenario from the scenario input', () => {
      const modFixture = TestBed.createComponent(ChargeMaterialComponent);
      modFixture.componentRef.setInput('scenario', 'mod-1');
      modFixture.detectChanges();

      expect(chargeMaterialServiceSpy.initialize).toHaveBeenCalledWith('mod-1');
    });
  });

  describe('resultsUnit', () => {
    it('computes kW when energyResultUnit is kWh', () => {
      settingsSignal.set({ ...MOCK_SETTINGS, energyResultUnit: 'kWh' });
      expect(component.resultsUnit()).toBe('kW');
    });

    it('computes <unit>/hr for other energy result units', () => {
      settingsSignal.set({ ...MOCK_SETTINGS, energyResultUnit: 'Btu' });
      expect(component.resultsUnit()).toBe('Btu/hr');
    });
  });

  describe('user-triggered actions', () => {
    it('calls setName with the item id and given name on name change', () => {
      component.onNameChange(solidItem, 'New Name');
      expect(chargeMaterialServiceSpy.setName).toHaveBeenCalledWith(solidItem.id, 'New Name');
    });

    it('calls switchType with the item id and selected type on type change', () => {
      component.onTypeChange(solidItem, ChargeMaterialType.Liquid);
      expect(chargeMaterialServiceSpy.switchType).toHaveBeenCalledWith(solidItem.id, ChargeMaterialType.Liquid);
    });

    it('calls add on the service when a material is added', () => {
      component.addMaterial();
      expect(chargeMaterialServiceSpy.add).toHaveBeenCalled();
    });

    it('calls remove with the item id when a material is removed', () => {
      component.removeMaterial(solidItem);
      expect(chargeMaterialServiceSpy.remove).toHaveBeenCalledWith(solidItem.id);
    });

    it('calls toggleCollapse with the item id', () => {
      component.toggleCollapse(solidItem);
      expect(chargeMaterialServiceSpy.toggleCollapse).toHaveBeenCalledWith(solidItem.id);
    });

    it('reflects the collapsed state for an item from collapsedIds', () => {
      expect(component.isCollapsed(solidItem)).toBeFalse();

      collapsedIdsSignal.set(new Set([solidItem.id]));
      expect(component.isCollapsed(solidItem)).toBeTrue();
    });
  });

  describe('template rendering', () => {
    it('hides totals when there are no materials', () => {
      expect(fixture.nativeElement.querySelector('.charge-material-totals')).toBeNull();
    });

    it('shows totals with values from materialResultTotals when materials exist', () => {
      materialsSignal.set([solidItem]);
      materialResultTotalsSignal.set({ heatRequired: 12, netHeatLoss: 8, endoExoHeat: 4 });
      fixture.detectChanges();

      const totals = fixture.nativeElement.querySelector('.charge-material-totals').textContent;
      expect(totals).toContain('12');
      expect(totals).toContain('8');
      expect(totals).toContain('4');
    });

    it('shows the empty-data message and add button when there are no materials and addition is not locked', () => {
      expect(fixture.nativeElement.querySelector('.no-data')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.btn-primary')).not.toBeNull();
    });

    it('shows the locked message instead of the empty-data message when there are no materials and addition is locked', () => {
      isMaterialAdditionLockedSignal.set(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.alert-info')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.no-data')).toBeNull();
    });

    it('shows an add button when materials exist and addition is not locked', () => {
      materialsSignal.set([solidItem]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.btn-primary')).not.toBeNull();
    });

    it('hides the add button when materials exist and addition is locked', () => {
      materialsSignal.set([solidItem]);
      isMaterialAdditionLockedSignal.set(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.btn-primary')).toBeNull();
    });

    it('hides the remove button on a card when addition is locked', () => {
      materialsSignal.set([solidItem]);
      isMaterialAdditionLockedSignal.set(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.text-danger')).toBeNull();
    });

    it('shows the remove button on a card when addition is not locked', () => {
      materialsSignal.set([solidItem]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.text-danger')).not.toBeNull();
    });

    it('shows the summary view and hides the sub-form when the item is collapsed', () => {
      materialsSignal.set([solidItem]);
      collapsedIdsSignal.set(new Set([solidItem.id]));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.charge-material-summary')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-charge-material-solid-form')).toBeNull();
    });

    it('shows the sub-form and hides the summary view when the item is expanded', () => {
      materialsSignal.set([solidItem]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.charge-material-summary')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-charge-material-solid-form')).not.toBeNull();
    });

    it('renders the liquid sub-form for a liquid item', () => {
      materialsSignal.set([liquidItem]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-charge-material-liquid-form')).not.toBeNull();
    });

    it('renders the gas sub-form for a gas item', () => {
      materialsSignal.set([gasItem]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-charge-material-gas-form')).not.toBeNull();
    });
  });
});
