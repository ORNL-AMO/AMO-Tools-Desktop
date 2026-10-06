import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';
import { Settings } from '../../../../shared/models/settings';
import { ExhaustGasFormComponent } from './exhaust-gas-form.component';
import { ExhaustGasFormService } from './exhaust-gas-form.service';
import { ExhaustGasItem } from './exhaust-gas.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: ExhaustGasFormService, overrides: Partial<ExhaustGasEAF> = {}): ExhaustGasItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getExhaustGasForm({
      offGasTemp: 2000, CO: 10, H2: 5, combustibleGases: 2, vfr: 1000, dustLoading: 0.01, ...overrides,
    }),
  };
}

describe('ExhaustGasFormComponent', () => {
  let component: ExhaustGasFormComponent;
  let fixture: ComponentFixture<ExhaustGasFormComponent>;
  let formService: ExhaustGasFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ExhaustGasFormComponent],
      providers: [ExhaustGasFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(ExhaustGasFormService);
    fixture = TestBed.createComponent(ExhaustGasFormComponent);
    component = fixture.componentInstance;
  });

  function render(item: ExhaustGasItem = makeItem(formService), settings: Settings = MOCK_SETTINGS): void {
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('exposes the item form', () => {
      const item = makeItem(formService);
      render(item);

      expect(component.form()).toBe(item.form as ReturnType<typeof component.form>);
    });

    it('generates a control id for every form control', () => {
      render();

      expect(Object.keys(component.controlIds())).toEqual(Object.keys(component.form().controls));
    });
  });

  describe('template visibility', () => {
    it('marks the off gas temperature group invalid when it is empty', () => {
      render(makeItem(formService, { offGasTemp: undefined }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().offGasTemp}"]`).closest('.input-group').classList).toContain('invalid');
    });

    it('does not mark a filled field invalid', () => {
      render();

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().offGasTemp}"]`).closest('.input-group').classList).not.toContain('invalid');
    });

    it('marks a percentage field invalid above 100', () => {
      render(makeItem(formService, { CO: 150 }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().CO}"]`).closest('.input-group').classList).toContain('invalid');
    });

    it('shows Imperial units by default', () => {
      render();

      expect(fixture.nativeElement.textContent).toContain('℉');
    });

    it('shows Metric units when settings are Metric', () => {
      render(makeItem(formService), { ...MOCK_SETTINGS, unitsOfMeasure: 'Metric' });

      expect(fixture.nativeElement.textContent).toContain('℃');
    });
  });
});
