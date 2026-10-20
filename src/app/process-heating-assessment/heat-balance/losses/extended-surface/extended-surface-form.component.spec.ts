import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ExtendedSurface } from '../../../models/extended-surface';
import { Settings } from '../../../../shared/models/settings';
import { ExtendedSurfaceFormComponent } from './extended-surface-form.component';
import { ExtendedSurfaceFormService } from './extended-surface-form.service';
import { ExtendedSurfaceItem } from './extended-surface.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: ExtendedSurfaceFormService, overrides: Partial<ExtendedSurface> = {}): ExtendedSurfaceItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getExtendedSurfaceForm({ ...overrides }),
  };
}

describe('ExtendedSurfaceFormComponent', () => {
  let component: ExtendedSurfaceFormComponent;
  let fixture: ComponentFixture<ExtendedSurfaceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ExtendedSurfaceFormComponent],
      providers: [ExtendedSurfaceFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtendedSurfaceFormComponent);
    component = fixture.componentInstance;
  });

  function render(): void {
    fixture.componentRef.setInput('item', makeItem(TestBed.inject(ExtendedSurfaceFormService), { surfaceArea: 100, surfaceTemperature: 300, ambientTemperature: 80, surfaceEmissivity: 0.9 }));
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  const field = (id: string): HTMLElement => fixture.nativeElement.querySelector(`[id="${id}"]`);

  describe('compare indicators', () => {
    it('highlights fields listed as differing from baseline', () => {
      render();
      fixture.componentRef.setInput('differingFields', new Set(['surfaceArea']));
      fixture.detectChanges();

      expect(field(component.controlIds().surfaceArea).closest('.input-group')!.classList).toContain('indicate-different');
    });

    it('leaves fields that match baseline unhighlighted', () => {
      render();
      fixture.componentRef.setInput('differingFields', new Set(['surfaceArea']));
      fixture.detectChanges();

      expect(field(component.controlIds().ambientTemp).closest('.input-group')!.classList).not.toContain('indicate-different');
    });

    it('highlights nothing without differing fields', () => {
      render();

      expect(fixture.nativeElement.querySelector('.indicate-different')).toBeNull();
    });
  });
});
