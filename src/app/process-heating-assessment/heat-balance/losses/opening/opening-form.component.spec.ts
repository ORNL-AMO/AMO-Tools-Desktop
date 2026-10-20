import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../../shared/models/settings';
import { OpeningFormComponent } from './opening-form.component';
import { OpeningFormService } from './opening-form.service';
import { OpeningItem } from './opening.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: OpeningFormService, overrides: Partial<OpeningLoss> = {}): OpeningItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getOpeningForm({ ...overrides }),
  };
}

describe('OpeningFormComponent', () => {
  let component: OpeningFormComponent;
  let fixture: ComponentFixture<OpeningFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [OpeningFormComponent],
      providers: [OpeningFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OpeningFormComponent);
    component = fixture.componentInstance;
  });

  function render(): void {
    fixture.componentRef.setInput('item', makeItem(TestBed.inject(OpeningFormService), { openingType: 'Rectangular (or Square)', numberOfOpenings: 1, thickness: 5, lengthOfOpening: 10, heightOfOpening: 10, viewFactor: 0.5, insideTemperature: 1000, ambientTemperature: 80, emissivity: 0.9, percentTimeOpen: 50 }));
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  const field = (id: string): HTMLElement => fixture.nativeElement.querySelector(`[id="${id}"]`);

  describe('compare indicators', () => {
    it('highlights fields listed as differing from baseline', () => {
      render();
      fixture.componentRef.setInput('differingFields', new Set(['thickness']));
      fixture.detectChanges();

      expect(field(component.controlIds().thickness).closest('.input-group')!.classList).toContain('indicate-different');
    });

    it('leaves fields that match baseline unhighlighted', () => {
      render();
      fixture.componentRef.setInput('differingFields', new Set(['thickness']));
      fixture.detectChanges();

      expect(field(component.controlIds().insideTemperature).closest('.input-group')!.classList).not.toContain('indicate-different');
    });

    it('highlights nothing without differing fields', () => {
      render();

      expect(fixture.nativeElement.querySelector('.indicate-different')).toBeNull();
    });
  });
});
