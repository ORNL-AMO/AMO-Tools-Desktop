import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { Settings } from '../../../../shared/models/settings';
import { SlagFormComponent } from './slag-form.component';
import { SlagFormService } from './slag-form.service';
import { SlagItem } from './slag.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: SlagFormService, overrides: Partial<Slag> = {}): SlagItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getSlagForm({
      weight: 100, inletTemperature: 1500, outletTemperature: 2800, specificHeat: 0.2, correctionFactor: 1, ...overrides,
    }),
  };
}

describe('SlagFormComponent', () => {
  let component: SlagFormComponent;
  let fixture: ComponentFixture<SlagFormComponent>;
  let formService: SlagFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SlagFormComponent],
      providers: [SlagFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(SlagFormService);
    fixture = TestBed.createComponent(SlagFormComponent);
    component = fixture.componentInstance;
  });

  function render(item: SlagItem = makeItem(formService), settings: Settings = MOCK_SETTINGS): void {
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
    it('marks the weight group invalid when it is empty', () => {
      render(makeItem(formService, { weight: undefined }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().weight}"]`).closest('.input-group').classList).toContain('invalid');
    });

    it('does not mark a filled field invalid', () => {
      render();

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().weight}"]`).closest('.input-group').classList).not.toContain('invalid');
    });

    it('marks the correction factor invalid when negative', () => {
      render(makeItem(formService, { correctionFactor: -1 }));

      expect(fixture.nativeElement.querySelector(`[id="${component.controlIds().correctionFactor}"]`).classList).toContain('invalid');
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
