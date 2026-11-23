import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { StackLossByVolumeComponent } from './stack-loss-by-volume.component';
import { FlueGasMaterialDbService } from '../../../../../indexedDb/flue-gas-material-db.service';
import { StackLossService } from '../../stack-loss.service';
import { PhastService } from '../../../../../phast/phast.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../../settings/settings.service';
import { FlueGasMaterial } from '../../../../../shared/models/materials';

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

function makeMaterial(id: number, substance: string): FlueGasMaterial {
  return { id, substance, CH4: 90, C2H6: 5, N2: 1, H2: 0, C3H8: 1, C4H10_CnH2n: 1, H2O: 0, CO: 0, CO2: 1, SO2: 0, O2: 1 } as FlueGasMaterial;
}

function makeVolumeForm(overrides: { [key: string]: any } = {}): UntypedFormGroup {
  const values = { oxygenCalculationMethod: 'Excess Air', flueGasTemperature: 300, ambientAirTemp: 60, ...overrides };
  return new UntypedFormBuilder().group({
    gasTypeId: [1, Validators.required],
    flueGasTemperature: [values.flueGasTemperature, Validators.required],
    oxygenCalculationMethod: [values.oxygenCalculationMethod, Validators.required],
    excessAirPercentage: [10, [Validators.required, Validators.min(0)]],
    o2InFlueGas: [2, [Validators.required, Validators.min(0), Validators.max(21)]],
    combustionAirTemperature: [60, [Validators.required]],
    moistureInAirCombustion: [.73, [Validators.required, Validators.min(0), Validators.max(100)]],
    fuelTemperature: [''],
    ambientAirTemp: [values.ambientAirTemp, Validators.required],
    CH4: [90, Validators.required], C2H6: [5, Validators.required], N2: [1, Validators.required],
    H2: [0, Validators.required], C3H8: [1, Validators.required], C4H10_CnH2n: [1, Validators.required],
    H2O: [0, Validators.required], CO: [0, Validators.required], CO2: [1, Validators.required],
    SO2: [0, Validators.required], O2: [1, Validators.required],
    name: ['Loss #1']
  });
}

describe('StackLossByVolumeComponent', () => {
  let component: StackLossByVolumeComponent;
  let fixture: ComponentFixture<StackLossByVolumeComponent>;
  let flueGasMaterialDbServiceSpy: jasmine.SpyObj<FlueGasMaterialDbService>;
  let dbFlueGasMaterials: BehaviorSubject<Array<FlueGasMaterial>>;
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

  function createComponent(form: UntypedFormGroup = makeVolumeForm(), inModal: boolean = false): void {
    fixture = TestBed.createComponent(StackLossByVolumeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stackLossForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('inModal', inModal);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    dbFlueGasMaterials = new BehaviorSubject<Array<FlueGasMaterial>>([makeMaterial(1, 'Natural Gas'), makeMaterial(2, 'Propane')]);
    flueGasMaterialDbServiceSpy = jasmine.createSpyObj('FlueGasMaterialDbService', ['getAllMaterials'], { dbFlueGasMaterials: dbFlueGasMaterials });
    flueGasMaterialDbServiceSpy.getAllMaterials.and.callFake(() => dbFlueGasMaterials.getValue());
    stackLossServiceMock = { modalOpen: new BehaviorSubject<boolean>(false) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedPipesModule],
      declarations: [StackLossByVolumeComponent, BsModalStubDirective],
      providers: [
        ConvertUnitsService,
        { provide: FlueGasMaterialDbService, useValue: flueGasMaterialDbServiceSpy },
        { provide: StackLossService, useValue: stackLossServiceMock },
        { provide: PhastService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('loads the material options', () => {
      createComponent();
      expect(component.options.map(o => o.substance)).toEqual(['Natural Gas', 'Propane']);
    });

    it('sets the excess air method from the form', () => {
      createComponent();
      expect(component.calcMethodExcessAir).toBeTrue();
    });

    it('sets the oxygen method from the form', () => {
      createComponent(makeVolumeForm({ oxygenCalculationMethod: 'Oxygen in Flue Gas' }));
      expect(component.calcMethodExcessAir).toBeFalse();
    });

    it('fills the gas properties when they are empty', () => {
      const form = makeVolumeForm();
      form.controls.CH4.setValue('');
      form.controls.gasTypeId.setValue(2);
      createComponent(form);
      expect(component.stackLossForm.controls.CH4.value).toBe(90);
    });

    it('copies the ambient temperature into the combustion and fuel temperatures and emits', () => {
      const emitted = [];
      fixture = TestBed.createComponent(StackLossByVolumeComponent);
      component = fixture.componentInstance;
      component.emitCalculate.subscribe(form => emitted.push(form));
      fixture.componentRef.setInput('stackLossForm', makeVolumeForm({ ambientAirTemp: 70 }));
      fixture.componentRef.setInput('settings', MOCK_SETTINGS);
      fixture.detectChanges();
      expect(component.stackLossForm.controls.combustionAirTemperature.value).toBe(70);
      expect(component.stackLossForm.controls.fuelTemperature.value).toBe(70);
      expect(emitted.length).toBeGreaterThan(0);
    });
  });

  describe('observe material changes', () => {
    it('reloads options when the material list changes', () => {
      createComponent();
      dbFlueGasMaterials.next([makeMaterial(3, 'Butane')]);
      expect(component.options.map(o => o.substance)).toEqual(['Butane']);
    });

    it('stops reloading options after destroy', () => {
      createComponent();
      fixture.destroy();
      dbFlueGasMaterials.next([makeMaterial(3, 'Butane')]);
      expect(component.options.map(o => o.substance)).toEqual(['Natural Gas', 'Propane']);
    });
  });

  describe('method changes', () => {
    beforeEach(() => createComponent());

    it('zeroes both values and switches to the oxygen method', () => {
      component.stackLossForm.controls.oxygenCalculationMethod.setValue('Oxygen in Flue Gas');
      component.changeMethod();
      expect(component.calcMethodExcessAir).toBeFalse();
      expect(component.stackLossForm.controls.o2InFlueGas.value).toBe(0);
      expect(component.stackLossForm.controls.excessAirPercentage.value).toBe(0);
    });
  });

  describe('stack temperature warning', () => {
    it('sets tempMin to 212 F', () => {
      createComponent();
      expect(component.tempMin).toBe(212);
    });

    it('hides the warning above the minimum', () => {
      createComponent();
      expect(component.stackTemperatureWarning).toBeFalse();
      expect(query('.alert-warning')).toBeNull();
    });

    it('shows the warning below the minimum', () => {
      createComponent(makeVolumeForm({ flueGasTemperature: 150 }));
      expect(component.stackTemperatureWarning).toBeTrue();
      expect(normalize(query('.alert-warning').textContent)).toContain('Stack Temperature less than 212 ℉, gases may be condensing');
    });
  });

  describe('template lists', () => {
    beforeEach(() => createComponent());

    it('renders one option per material', () => {
      expect(queryAll('#gasTypeId option').map(o => o.textContent.trim())).toEqual(['Natural Gas', 'Propane']);
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
      createComponent(makeVolumeForm(), true);
      expect(query('#materialHelp')).toBeNull();
    });

    it('shows only excess air input with the excess air method', () => {
      createComponent();
      expect(query('#excessAirPercentage')).not.toBeNull();
      expect(query('#o2InFlueGas')).toBeNull();
    });

    it('shows only the O2 input with the oxygen method', () => {
      createComponent(makeVolumeForm({ oxygenCalculationMethod: 'Oxygen in Flue Gas' }));
      expect(query('#o2InFlueGas')).not.toBeNull();
      expect(query('#excessAirPercentage')).toBeNull();
    });
  });

  describe('material modal', () => {
    beforeEach(() => createComponent());

    it('hides the material form while the modal is closed', () => {
      expect(query('app-flue-gas-material')).toBeNull();
    });

    it('shows the material form and flags the modal open when shown', () => {
      component.showMaterialModal();
      fixture.detectChanges();
      expect(query('app-flue-gas-material')).not.toBeNull();
      expect(stackLossServiceMock.modalOpen.getValue()).toBeTrue();
    });

    it('selects the new material and hides the modal on close', async () => {
      component.showMaterialModal();
      fixture.detectChanges();
      await component.hideMaterialModal({ substance: 'Propane' });
      fixture.detectChanges();
      expect(component.stackLossForm.controls.gasTypeId.value).toBe(2);
      expect(stackLossServiceMock.modalOpen.getValue()).toBeFalse();
      expect(query('app-flue-gas-material')).toBeNull();
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

    it('hides the ambient temperature error while pristine', () => {
      createComponent();
      component.stackLossForm.controls.ambientAirTemp.setValue(null);
      fixture.detectChanges();
      expect(errorBlock('ambientAirTemp')).toBeNull();
    });

    it('shows the required message for ambient temperature', () => {
      createComponent();
      setDirty('ambientAirTemp', null);
      expect(messages('ambientAirTemp')).toEqual(['Value Required']);
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

    describe('O2 in flue gas', () => {
      beforeEach(() => createComponent(makeVolumeForm({ oxygenCalculationMethod: 'Oxygen in Flue Gas' })));

      it('hides the error for a valid value', () => {
        setDirty('o2InFlueGas', 5);
        expect(errorBlock('o2InFlueGas')).toBeNull();
      });

      it('shows only the required message', () => {
        setDirty('o2InFlueGas', null);
        expect(messages('o2InFlueGas')).toEqual(['Value Required']);
      });

      it('shows only the max message', () => {
        setDirty('o2InFlueGas', 22);
        expect(messages('o2InFlueGas')).toEqual(['Value can\'t be greater than 20.5 %.']);
      });

      it('shows only the min message', () => {
        setDirty('o2InFlueGas', -1);
        expect(messages('o2InFlueGas')).toEqual(['Value can\'t be less than 0 %.']);
      });
    });
  });
});
