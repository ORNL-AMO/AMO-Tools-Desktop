import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { StackLossByMassComponent } from './stack-loss-by-mass.component';
import { SolidLiquidMaterialDbService } from '../../../../../indexedDb/solid-liquid-material-db.service';
import { StackLossService } from '../../stack-loss.service';
import { PhastService } from '../../../../../phast/phast.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../../settings/settings.service';
import { SolidLiquidFlueGasMaterial } from '../../../../../shared/models/materials';

@Directive({
  selector: '[bsModal]',
  exportAs: 'bs-modal',
  standalone: false,
})
class BsModalStubDirective {
  isShown = false;
  show = jasmine.createSpy('show').and.callFake(() => this.isShown = true);
  hide = jasmine.createSpy('hide').and.callFake(() => this.isShown = false);
}

const MOCK_SETTINGS = { ...SteamImperialDefaults, unitsOfMeasure: 'Imperial' } as Settings;

function makeMaterial(id: number, substance: string): SolidLiquidFlueGasMaterial {
  return { id, substance, carbon: 70, hydrogen: 5, sulphur: 1, inertAsh: 10, o2: 7, moisture: 5, nitrogen: 2 } as SolidLiquidFlueGasMaterial;
}

function makeMassForm(overrides: { [key: string]: any } = {}): UntypedFormGroup {
  const values = { oxygenCalculationMethod: 'Excess Air', flueGasTemperature: 300, ambientAirTemp: 60, carbon: 70, ...overrides };
  return new UntypedFormBuilder().group({
    gasTypeId: [1, Validators.required],
    flueGasTemperature: [values.flueGasTemperature, Validators.required],
    oxygenCalculationMethod: [values.oxygenCalculationMethod, Validators.required],
    excessAirPercentage: [10, [Validators.required, Validators.min(0)]],
    o2InFlueGas: [2, [Validators.required, Validators.min(0), Validators.max(21)]],
    combustionAirTemperature: [60, [Validators.required]],
    fuelTemperature: [''],
    ambientAirTemp: [values.ambientAirTemp, Validators.required],
    moistureInAirCombustion: [.73, [Validators.required, Validators.min(0), Validators.max(100)]],
    ashDischargeTemperature: [100, Validators.required],
    unburnedCarbonInAsh: [1, [Validators.required, Validators.min(0), Validators.max(100)]],
    carbon: [values.carbon, Validators.required], hydrogen: [5, Validators.required], sulphur: [1, Validators.required],
    inertAsh: [10, Validators.required], o2: [7, Validators.required], moisture: [5, Validators.required],
    nitrogen: [2, Validators.required],
    name: ['Loss #1']
  });
}

describe('StackLossByMassComponent', () => {
  let component: StackLossByMassComponent;
  let fixture: ComponentFixture<StackLossByMassComponent>;
  let solidLiquidMaterialDbServiceSpy: jasmine.SpyObj<SolidLiquidMaterialDbService>;
  let dbMaterials: BehaviorSubject<Array<SolidLiquidFlueGasMaterial>>;
  let phastServiceSpy: jasmine.SpyObj<PhastService>;
  let stackLossServiceMock: Partial<StackLossService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string, root: HTMLElement = fixture.nativeElement): HTMLElement[] {
    return Array.from(root.querySelectorAll(selector));
  }

  function normalize(text: string): string {
    return text.trim().replace(/\s+/g, ' ').replace(/ \./g, '.');
  }

  function errorBlock(field: string): HTMLElement | null {
    return query(`#${field}`).closest('.form-group').querySelector(':scope > .alert-danger');
  }

  function messages(field: string): string[] {
    return queryAll(':scope > span', errorBlock(field)).map(s => normalize(s.textContent));
  }

  function setDirty(field: string, value: any): void {
    component.stackLossForm.controls[field].setValue(value);
    component.stackLossForm.controls[field].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(form: UntypedFormGroup = makeMassForm(), inModal: boolean = false): void {
    fixture = TestBed.createComponent(StackLossByMassComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stackLossForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('inModal', inModal);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    dbMaterials = new BehaviorSubject<Array<SolidLiquidFlueGasMaterial>>([makeMaterial(1, 'Coal'), makeMaterial(2, 'Wood')]);
    solidLiquidMaterialDbServiceSpy = jasmine.createSpyObj('SolidLiquidMaterialDbService', ['getById'], { dbSolidLiquidFlueGasMaterials: dbMaterials });
    solidLiquidMaterialDbServiceSpy.getById.and.callFake((id: number) => dbMaterials.getValue().find(m => m.id === id));
    phastServiceSpy = jasmine.createSpyObj('PhastService', ['flueGasByMassCalculateExcessAir', 'flueGasByMassCalculateO2']);
    phastServiceSpy.flueGasByMassCalculateExcessAir.and.returnValue(12.5);
    phastServiceSpy.flueGasByMassCalculateO2.and.returnValue(3.25);
    stackLossServiceMock = { modalOpen: new BehaviorSubject<boolean>(false) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedPipesModule],
      declarations: [StackLossByMassComponent, BsModalStubDirective],
      providers: [
        ConvertUnitsService,
        { provide: SolidLiquidMaterialDbService, useValue: solidLiquidMaterialDbServiceSpy },
        { provide: StackLossService, useValue: stackLossServiceMock },
        { provide: PhastService, useValue: phastServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('loads the material options', () => {
      createComponent();
      expect(component.options.map(o => o.substance)).toEqual(['Coal', 'Wood']);
    });

    it('fills the fuel properties when carbon is empty', () => {
      const form = makeMassForm({ carbon: '' });
      form.controls.gasTypeId.setValue(2);
      createComponent(form);
      expect(solidLiquidMaterialDbServiceSpy.getById).toHaveBeenCalledWith(2);
      expect(component.stackLossForm.controls.carbon.value).toBe(70);
    });

    it('calculates O2 from excess air with the excess air method', () => {
      createComponent();
      expect(component.calcMethodExcessAir).toBeTrue();
      expect(phastServiceSpy.flueGasByMassCalculateO2).toHaveBeenCalled();
      expect(component.stackLossForm.controls.o2InFlueGas.value).toBe(3.25);
    });

    it('calculates excess air from O2 with the oxygen method', () => {
      createComponent(makeMassForm({ oxygenCalculationMethod: 'Oxygen in Flue Gas' }));
      expect(component.calcMethodExcessAir).toBeFalse();
      expect(phastServiceSpy.flueGasByMassCalculateExcessAir).toHaveBeenCalled();
      expect(component.stackLossForm.controls.excessAirPercentage.value).toBe(12.5);
    });

    it('copies the ambient temperature into the combustion temperature', () => {
      createComponent(makeMassForm({ ambientAirTemp: 70 }));
      expect(component.stackLossForm.controls.combustionAirTemperature.value).toBe(70);
    });
  });

  describe('calcExcessAir', () => {
    it('zeroes the calculated O2 when excess air is invalid', () => {
      createComponent();
      phastServiceSpy.flueGasByMassCalculateO2.calls.reset();
      component.stackLossForm.controls.excessAirPercentage.setValue(-1);
      component.calcExcessAir();
      expect(phastServiceSpy.flueGasByMassCalculateO2).not.toHaveBeenCalled();
      expect(component.calculationFlueGasO2).toBe(0);
    });

    it('zeroes the calculated excess air when O2 is invalid', () => {
      createComponent(makeMassForm({ oxygenCalculationMethod: 'Oxygen in Flue Gas' }));
      phastServiceSpy.flueGasByMassCalculateExcessAir.calls.reset();
      component.stackLossForm.controls.o2InFlueGas.setValue(30);
      component.calcExcessAir();
      expect(phastServiceSpy.flueGasByMassCalculateExcessAir).not.toHaveBeenCalled();
      expect(component.calculationExcessAir).toBe(0);
    });
  });

  describe('observe material changes', () => {
    it('reloads options when the material list changes', () => {
      createComponent();
      dbMaterials.next([makeMaterial(3, 'Oil')]);
      expect(component.options.map(o => o.substance)).toEqual(['Oil']);
    });

    it('stops reloading options after destroy', () => {
      createComponent();
      fixture.destroy();
      dbMaterials.next([makeMaterial(3, 'Oil')]);
      expect(component.options.map(o => o.substance)).toEqual(['Coal', 'Wood']);
    });
  });

  describe('stack temperature warning', () => {
    it('hides the warning above the minimum', () => {
      createComponent();
      expect(component.tempMin).toBe(212);
      expect(query('.alert-warning')).toBeNull();
    });

    it('shows the warning below the minimum', () => {
      createComponent(makeMassForm({ flueGasTemperature: 150 }));
      expect(component.stackTemperatureWarning).toBeTrue();
      expect(normalize(query('.alert-warning').textContent)).toContain('Stack Temperature less than 212 ℉, gases may be condensing');
    });
  });

  describe('template lists', () => {
    beforeEach(() => createComponent());

    it('renders one option per material', () => {
      expect(queryAll('#gasTypeId option').map(o => o.textContent.trim())).toEqual(['Coal', 'Wood']);
    });

    it('renders one option per calculation method', () => {
      expect(queryAll('#oxygenCalculationMethod option').map(o => o.textContent.trim())).toEqual(['Excess Air', 'Oxygen in Flue Gas']);
    });
  });

  describe('template visibility', () => {
    it('shows the add new fuel link outside a modal', () => {
      createComponent();
      expect(query('#materialHelp')).not.toBeNull();
    });

    it('hides the add new fuel link in a modal', () => {
      createComponent(makeMassForm(), true);
      expect(query('#materialHelp')).toBeNull();
    });

    it('shows the excess air input and calculated O2 with the excess air method', () => {
      createComponent();
      expect(query('#excessAirPercentage')).not.toBeNull();
      expect(query('#o2InFlueGas')).toBeNull();
      const group = query('#excessAirPercentage').closest('.form-group') as HTMLElement;
      expect(normalize(group.querySelector('.text-center').textContent)).toBe('03.25 %');
    });

    it('shows the O2 input and calculated excess air with the oxygen method', () => {
      createComponent(makeMassForm({ oxygenCalculationMethod: 'Oxygen in Flue Gas' }));
      expect(query('#o2InFlueGas')).not.toBeNull();
      expect(query('#excessAirPercentage')).toBeNull();
      const group = query('#o2InFlueGas').closest('.form-group') as HTMLElement;
      expect(normalize(group.querySelector('.text-center').textContent)).toBe('12.50 %');
    });
  });

  describe('material modal', () => {
    beforeEach(() => createComponent());

    it('hides the material form while the modal is closed', () => {
      expect(query('app-solid-liquid-flue-gas-material')).toBeNull();
    });

    it('shows the material form and flags the modal open when shown', () => {
      component.showMaterialModal();
      fixture.detectChanges();
      expect(query('app-solid-liquid-flue-gas-material')).not.toBeNull();
      expect(stackLossServiceMock.modalOpen.getValue()).toBeTrue();
    });

    it('selects the new material and hides the modal on close', () => {
      component.showMaterialModal();
      fixture.detectChanges();
      component.hideMaterialModal({ substance: 'Wood' });
      fixture.detectChanges();
      expect(component.stackLossForm.controls.gasTypeId.value).toBe(2);
      expect(stackLossServiceMock.modalOpen.getValue()).toBeFalse();
      expect(query('app-solid-liquid-flue-gas-material')).toBeNull();
    });
  });

  describe('validation messages', () => {
    it('hides the stack gas temperature error while valid', () => {
      createComponent();
      expect(errorBlock('flueGasTemperature')).toBeNull();
    });

    it('shows only the required message for stack gas temperature', () => {
      createComponent();
      setDirty('flueGasTemperature', null);
      expect(messages('flueGasTemperature')).toEqual(['Value Required']);
    });

    it('shows only the ambient minimum message for stack gas temperature', () => {
      createComponent();
      setDirty('flueGasTemperature', 50);
      const shown = messages('flueGasTemperature');
      expect(shown.length).toBe(1);
      expect(shown[0]).toContain('Value can\'t be less than Ambient Temperature (60');
    });

    [
      { field: 'ambientAirTemp' },
      { field: 'ashDischargeTemperature' },
    ].forEach(({ field }) => {
      it(`hides the ${field} error while pristine`, () => {
        createComponent();
        component.stackLossForm.controls[field].setValue(null);
        fixture.detectChanges();
        expect(errorBlock(field)).toBeNull();
      });

      it(`shows the required message for ${field}`, () => {
        createComponent();
        setDirty(field, null);
        expect(messages(field)).toEqual(['Value Required']);
      });
    });

    describe('excess air', () => {
      beforeEach(() => createComponent());

      it('hides the error for a valid value', () => {
        setDirty('excessAirPercentage', 5);
        expect(errorBlock('excessAirPercentage')).toBeNull();
      });

      it('shows only the required message', () => {
        setDirty('excessAirPercentage', null);
        expect(messages('excessAirPercentage')).toEqual(['Value Required']);
      });

      it('shows only the min message', () => {
        setDirty('excessAirPercentage', -1);
        expect(messages('excessAirPercentage')).toEqual(['Value can\'t be less than 0 %.']);
      });
    });

    [
      { field: 'o2InFlueGas', method: 'Oxygen in Flue Gas', max: 20.5 },
      { field: 'unburnedCarbonInAsh', method: 'Excess Air', max: 100 },
    ].forEach(({ field, method, max }) => {
      describe(field, () => {
        beforeEach(() => createComponent(makeMassForm({ oxygenCalculationMethod: method })));

        it('hides the error for a valid value', () => {
          setDirty(field, 5);
          expect(errorBlock(field)).toBeNull();
        });

        it('shows only the required message', () => {
          setDirty(field, null);
          expect(messages(field)).toEqual(['Value Required']);
        });

        it('shows only the max message', () => {
          setDirty(field, max + 1);
          expect(messages(field)).toEqual([`Value can't be greater than ${max} %.`]);
        });

        it('shows only the min message', () => {
          setDirty(field, -1);
          expect(messages(field)).toEqual(['Value can\'t be less than 0 %.']);
        });
      });
    });
  });
});
