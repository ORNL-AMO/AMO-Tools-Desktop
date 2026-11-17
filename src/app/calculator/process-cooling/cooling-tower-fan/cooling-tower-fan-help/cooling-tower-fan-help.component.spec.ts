import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerFanHelpComponent } from './cooling-tower-fan-help.component';
import { CoolingTowerFanService } from '../cooling-tower-fan.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'operatingHours', heading: 'Annual Operating Hours' },
  { field: 'towerType', heading: 'Tower Type' },
  { field: 'numCells', heading: 'Number of Cells' },
  { field: 'ratedFanPower', heading: 'Rated Fan Power' },
  { field: 'waterLeavingTemp', heading: 'Leaving Cooling Tower Water Temperature' },
  { field: 'waterEnteringTemp', heading: 'Entering Cooling Water Temperature' },
  { field: 'operatingTempWetBulb', heading: 'Ambient Wet Bulb Temperature' },
  { field: 'waterFlowRate', heading: 'Water Flow Rate' },
  { field: 'baselineSpeedType', heading: 'Fan Control' },
  { field: 'modSpeedType', heading: 'Fan Control' },
  { field: 'electricityCost', heading: 'Electricity Cost' },
];

describe('CoolingTowerFanHelpComponent', () => {
  let component: CoolingTowerFanHelpComponent;
  let fixture: ComponentFixture<CoolingTowerFanHelpComponent>;
  let coolingTowerFanService: Partial<CoolingTowerFanService>;

  function getFieldHelp(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2 h6'));
  }

  function getHeading(el: HTMLElement): string {
    return el.firstChild.textContent.trim();
  }

  beforeEach(async () => {
    coolingTowerFanService = { currentField: new BehaviorSubject<string>(undefined) };

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerFanHelpComponent],
      providers: [{ provide: CoolingTowerFanService, useValue: coolingTowerFanService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoolingTowerFanHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('subscribes to the current field', () => {
      coolingTowerFanService.currentField.next('numCells');
      expect(component.currentField).toBe('numCells');
    });
  });

  describe('template visibility', () => {
    it('shows no field help when no field is focused', () => {
      expect(getFieldHelp().length).toBe(0);
    });

    it('shows no field help for an unknown field', () => {
      coolingTowerFanService.currentField.next('unknownField');
      fixture.detectChanges();
      expect(getFieldHelp().length).toBe(0);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`shows only the "${heading}" help for ${field}`, () => {
        coolingTowerFanService.currentField.next(field);
        fixture.detectChanges();
        const help = getFieldHelp();
        expect(help.length).toBe(1);
        expect(getHeading(help[0])).toBe(heading);
      });
    });

    it('always shows the constant water flow note', () => {
      expect(fixture.nativeElement.querySelector('.alert-info').textContent)
        .toContain('constant water flow rate');
    });
  });

  describe('destroy', () => {
    it('stops updating the current field after destroy', () => {
      coolingTowerFanService.currentField.next('numCells');
      fixture.destroy();
      coolingTowerFanService.currentField.next('towerType');
      expect(component.currentField).toBe('numCells');
    });
  });
});
