import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { WallLoss } from '../../../models/wall-loss';
import { Settings } from '../../../../shared/models/settings';
import { WallLossesFormComponent } from './wall-losses-form.component';
import { WallLossesFormService } from './wall-losses-form.service';
import { WallLossItem } from './wall-losses.service';
import { WallLossesService } from './wall-losses.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: WallLossesFormService, overrides: Partial<WallLoss> = {}): WallLossItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getWallLossForm({ ...overrides }),
  };
}

describe('WallLossesFormComponent', () => {
  let component: WallLossesFormComponent;
  let fixture: ComponentFixture<WallLossesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WallLossesFormComponent],
      providers: [WallLossesFormService, { provide: WallLossesService, useValue: { surfaceOptions: signal([]), updateItem: jasmine.createSpy('updateItem') } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WallLossesFormComponent);
    component = fixture.componentInstance;
  });

  function render(): void {
    fixture.componentRef.setInput('item', makeItem(TestBed.inject(WallLossesFormService), { surfaceArea: 100, surfaceTemperature: 300, ambientTemperature: 80, windVelocity: 5, surfaceShape: 1, surfaceEmissivity: 0.9 }));
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
