import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerHelpComponent } from './cooling-tower-help.component';
import { CoolingTowerService } from '../cooling-tower.service';

const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'flowRate', heading: 'Water Flow Rate' },
  { field: 'temperatureDifference', heading: 'Temperature Difference' },
  { field: 'coolingLoad', heading: 'Cooling Load' },
  { field: 'lossCorrectionFactor', heading: 'Evaporation Factor' },
  { field: 'hasDriftEliminator', heading: 'Drift Eliminator' },
  { field: 'driftLossFactor', heading: 'Drift Factor' },
  { field: 'cyclesOfConcentration', heading: 'Cycles of Concentration' },
  { field: 'operationalHours', heading: 'Annual Operating Hours' },
];

function makeService(): Partial<CoolingTowerService> {
  return { currentField: new BehaviorSubject<string>('default') };
}

describe('CoolingTowerHelpComponent', () => {
  let component: CoolingTowerHelpComponent;
  let fixture: ComponentFixture<CoolingTowerHelpComponent>;
  let service: Partial<CoolingTowerService>;

  function getFieldHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2 > h6'))
      .map((heading: HTMLElement) => heading.firstChild.textContent.trim());
  }

  function selectField(field: string): void {
    service.currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    service = makeService();
    await TestBed.configureTestingModule({
      declarations: [CoolingTowerHelpComponent],
      providers: [{ provide: CoolingTowerService, useValue: service }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoolingTowerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('takes the current field from the service', () => {
      expect(component.currentField).toBe('default');
    });

    it('always shows the calculator description', () => {
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Cooling Tower Makeup Water Help');
    });
  });

  describe('template visibility', () => {
    it('shows no field help for the default field', () => {
      expect(getFieldHeadings()).toEqual([]);
    });

    it('shows no field help for an unknown field', () => {
      selectField('waterCost');
      expect(getFieldHeadings()).toEqual([]);
    });

    FIELD_HEADINGS.forEach(testCase => {
      it(`shows only the ${testCase.heading} help when ${testCase.field} is focused`, () => {
        selectField(testCase.field);
        expect(getFieldHeadings()).toEqual([testCase.heading]);
      });
    });

    it('shows the operating hours range table only for operating hours', () => {
      selectField('flowRate');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      selectField('operationalHours');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('td')).map((cell: HTMLElement) => cell.textContent.trim());
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);
    });
  });

  describe('destroy', () => {
    it('stops following the current field after destroy', () => {
      fixture.destroy();
      service.currentField.next('flowRate');
      expect(component.currentField).toBe('default');
    });
  });
});
