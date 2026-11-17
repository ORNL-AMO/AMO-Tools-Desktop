import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HeadToolHelpComponent } from './head-tool-help.component';
import { Settings } from '../../../../shared/models/settings';

const TANK = 'Suction tank elevation';
const GAUGE = 'Suction gauge elevation';

const IMPERIAL_SETTINGS = { distanceMeasurement: 'ft' } as Settings;
const METRIC_SETTINGS = { distanceMeasurement: 'm' } as Settings;

// Fields whose help shows regardless of head tool type
const COMMON_FIELDS: Array<{ field: string, heading: string }> = [
  { field: 'headToolType', heading: 'Suction Gauge Reference Point' },
  { field: 'specificGravity', heading: 'Specific Gravity' },
  { field: 'flowRate', heading: 'Flow Rate' },
];

const TANK_FIELDS: Array<{ field: string, heading: string }> = [
  { field: 'suctionPipeDiameter', heading: 'Suction Pipe Diameter (ID)' },
  { field: 'suctionTankGasOverPressure', heading: 'Suction Tank gas overpressure (Pg)' },
  { field: 'suctionTankFluidSurfaceElevation', heading: 'Suction Tank fluid surface elevation (Zs)' },
  { field: 'suctionLineLossCoefficients', heading: 'Suction Line loss coefficients (Ks)' },
  { field: 'dischargePipeDiameter', heading: 'Discharge Pipe diameter (ID)' },
  { field: 'dischargeGaugePressure', heading: 'Discharge Gauge pressure (Pd)' },
  { field: 'dischargeGaugeElevation', heading: 'Discharge Gauge elevation (Zd)' },
  { field: 'dischargeLineLossCoefficients', heading: 'Discharge Line loss coefficients (Kd)' },
];

const GAUGE_FIELDS: Array<{ field: string, heading: string }> = [
  { field: 'suctionPipeDiameter', heading: 'Suction Pipe diameter (ID)' },
  { field: 'suctionGuagePressure', heading: 'Suction Gauge pressure (Pg)' },
  { field: 'suctionGuageElevation', heading: 'Suction Gauge elevation (Zs)' },
  { field: 'suctionLineLossCoefficients', heading: 'Suction Line loss coefficients (Ks)' },
  { field: 'dischargePipeDiameter', heading: 'Discharge Pipe diameter (ID)' },
  { field: 'dischargeGaugePressure', heading: 'Discharge Gauge pressure (Pd)' },
  { field: 'dischargeGaugeElevation', heading: 'Discharge Gauge elevation (Zd)' },
  { field: 'dischargeLineLossCoefficients', heading: 'Discharge Line loss coefficients (Kd)' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('HeadToolHelpComponent', () => {
  let component: HeadToolHelpComponent;
  let fixture: ComponentFixture<HeadToolHelpComponent>;

  function createComponent(currentField: string, headToolType: string, settings: Settings = IMPERIAL_SETTINGS): void {
    fixture = TestBed.createComponent(HeadToolHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentField', currentField);
    fixture.componentRef.setInput('headToolType', headToolType);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  // The heading text of each visible field-help block (h6 text before the <br>)
  function getVisibleHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('h6')).map((h6: HTMLElement) => {
      const firstLine = Array.from(h6.childNodes)
        .slice(0, Array.from(h6.childNodes).findIndex(node => node.nodeName === 'BR'))
        .map(node => node.textContent)
        .join('');
      return normalize(firstLine);
    });
  }

  function getRangeCells(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('td')).map((td: HTMLElement) => normalize(td.textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeadToolHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('uses inches as the small unit for imperial distance', () => {
      createComponent('flowRate', TANK, IMPERIAL_SETTINGS);
      expect(component.smallUnit).toBe('in');
    });

    it('uses millimeters as the small unit for metric distance', () => {
      createComponent('flowRate', TANK, METRIC_SETTINGS);
      expect(component.smallUnit).toBe('mm');
    });

    it('always renders the docs link', () => {
      createComponent('none', 'none');
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[target="_blank"]');
      expect(link.getAttribute('href')).toBe(component.docsLink + 'group__pump__head__calculator.html');
    });
  });

  describe('template visibility', () => {
    describe('common fields', () => {
      [TANK, GAUGE, 'none'].forEach(headToolType => {
        COMMON_FIELDS.forEach(({ field, heading }) => {
          it(`shows only the ${field} help for head tool type "${headToolType}"`, () => {
            createComponent(field, headToolType);
            expect(getVisibleHeadings()).toEqual([heading]);
          });
        });
      });
    });

    describe('suction tank elevation fields', () => {
      TANK_FIELDS.forEach(({ field, heading }) => {
        it(`shows only the tank ${field} help`, () => {
          createComponent(field, TANK);
          expect(getVisibleHeadings()).toEqual([heading]);
        });
      });

      it('hides the tank-only help when the head tool type is suction gauge', () => {
        createComponent('suctionTankGasOverPressure', GAUGE);
        expect(getVisibleHeadings()).toEqual([]);
      });

      it('does not show the pipe diameter range table for the tank discharge diameter', () => {
        createComponent('dischargePipeDiameter', TANK);
        expect(fixture.nativeElement.querySelector('table')).toBeNull();
      });
    });

    describe('suction gauge elevation fields', () => {
      GAUGE_FIELDS.forEach(({ field, heading }) => {
        it(`shows only the gauge ${field} help`, () => {
          createComponent(field, GAUGE);
          expect(getVisibleHeadings()).toEqual([heading]);
        });
      });

      it('hides the gauge-only help when the head tool type is suction tank', () => {
        createComponent('suctionGuagePressure', TANK);
        expect(getVisibleHeadings()).toEqual([]);
      });

      it('shows the discharge diameter range table in inches for imperial settings', () => {
        createComponent('dischargePipeDiameter', GAUGE, IMPERIAL_SETTINGS);
        expect(getRangeCells()).toEqual(['0 in', '2,000 in']);
      });

      it('shows the discharge diameter range table in millimeters for metric settings', () => {
        createComponent('dischargePipeDiameter', GAUGE, METRIC_SETTINGS);
        expect(getRangeCells()).toEqual(['0 mm', '2,000 mm']);
      });
    });

    it('hides every type-specific block for an unknown head tool type', () => {
      createComponent('suctionPipeDiameter', 'none');
      expect(getVisibleHeadings()).toEqual([]);
    });

    it('hides all field help for an unknown field', () => {
      createComponent('none', TANK);
      expect(getVisibleHeadings()).toEqual([]);
    });

    it('updates the visible help when the current field changes', () => {
      createComponent('flowRate', GAUGE);
      fixture.componentRef.setInput('currentField', 'suctionGuageElevation');
      fixture.detectChanges();
      expect(getVisibleHeadings()).toEqual(['Suction Gauge elevation (Zs)']);
    });

    it('updates the visible help when the head tool type changes', () => {
      createComponent('suctionPipeDiameter', GAUGE);
      fixture.componentRef.setInput('headToolType', TANK);
      fixture.detectChanges();
      expect(getVisibleHeadings()).toEqual(['Suction Pipe Diameter (ID)']);
    });
  });
});
