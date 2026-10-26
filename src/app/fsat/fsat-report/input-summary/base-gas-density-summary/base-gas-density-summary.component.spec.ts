import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { BaseGasDensitySummaryComponent } from './base-gas-density-summary.component';
import { BaseGasDensity, FSAT, Modification } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const DASH = '—';
const FAHRENHEIT = '℉';
const CELSIUS = '℃';

const ROW = {
  barometricPressure: 0,
  specificHeatRatio: 1,
  gasType: 2,
  inputType: 3,
  dryBulb: 4,
  staticPressure: 5,
  wetBulb: 6,
  relativeHumidity: 7,
  dewPoint: 8,
  gasDensity: 9,
};

function makeDensity(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return {
    barometricPressure: 29.92,
    specificHeatRatio: 1.4,
    gasType: 'AIR',
    inputType: 'relativeHumidity',
    dryBulbTemp: 68,
    staticPressure: -1.5,
    wetBulbTemp: 55,
    relativeHumidity: 40,
    dewPoint: 45,
    gasDensity: 0.075,
    ...overrides,
  };
}

function makeMod(name: string, density?: BaseGasDensity): Modification {
  return { id: name, fsat: { name, baseGasDensity: density } as FSAT };
}

function makeFsat(baseline: BaseGasDensity, modifications?: Modification[]): FSAT {
  return { baseGasDensity: baseline, modifications } as FSAT;
}

function makeSettings(unitsOfMeasure: string = 'Imperial'): Settings {
  return { unitsOfMeasure } as Settings;
}

describe('BaseGasDensitySummaryComponent', () => {
  let component: BaseGasDensitySummaryComponent;
  let fixture: ComponentFixture<BaseGasDensitySummaryComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [BaseGasDensitySummaryComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function setup(fsat: FSAT, options: { printView?: boolean; settings?: Settings; expanded?: boolean } = {}): void {
    fixture = TestBed.createComponent(BaseGasDensitySummaryComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    component.fsat = fsat;
    component.settings = options.settings ?? makeSettings();
    component.printView = options.printView ?? false;
    fixture.detectChanges();
    if (options.expanded) {
      component.toggleCollapse();
      fixture.detectChanges();
    }
  }

  function bodyRows(): HTMLElement[] {
    return Array.from(host.querySelectorAll('tbody tr'));
  }

  function cell(row: number, col: number): HTMLElement {
    return bodyRows()[row].querySelectorAll('td')[col] as HTMLElement;
  }

  function cellText(row: number, col: number): string {
    return cell(row, col).textContent.trim();
  }

  describe('initialization', () => {
    it('creates the component', () => {
      setup(makeFsat(makeDensity(), []));
      expect(component).toBeTruthy();
    });

    it('counts the modifications on the assessment', () => {
      setup(makeFsat(makeDensity(), [makeMod('A', makeDensity()), makeMod('B', makeDensity())]));
      expect(component.numMods).toBe(2);
    });
  });

  describe('user actions', () => {
    it('expands the table when the card header is clicked', () => {
      setup(makeFsat(makeDensity(), []));
      expect(host.querySelector('table')).toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).not.toBeNull();
    });

    it('collapses the table when the card header is clicked again', () => {
      setup(makeFsat(makeDensity(), []), { expanded: true });
      expect(host.querySelector('table')).not.toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).toBeNull();
    });
  });

  describe('template visibility', () => {
    describe('collapse / printView', () => {
      it('hides the table when collapsed and not in print view', () => {
        setup(makeFsat(makeDensity(), []));
        expect(host.querySelector('.card-body')).toBeNull();
        expect(host.querySelector('table')).toBeNull();
      });

      it('shows the table when expanded', () => {
        setup(makeFsat(makeDensity(), []), { expanded: true });
        expect(host.querySelector('.card-body')).not.toBeNull();
        expect(host.querySelector('table')).not.toBeNull();
      });

      it('shows the table when collapsed but in print view', () => {
        setup(makeFsat(makeDensity(), []), { printView: true });
        expect(component.collapse).toBeTrue();
        expect(host.querySelector('table')).not.toBeNull();
      });
    });

    describe('modification columns', () => {
      it('renders only the label and baseline columns when there are no modifications', () => {
        setup(makeFsat(makeDensity(), []), { printView: true });
        expect(host.querySelectorAll('thead th').length).toBe(2);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(2));
      });

      it('renders one header and one cell per row for each modification', () => {
        const mods = [makeMod('Mod A', makeDensity()), makeMod('Mod B', makeDensity())];
        setup(makeFsat(makeDensity(), mods), { printView: true });

        const headers = Array.from(host.querySelectorAll('thead th')).map(th => th.textContent.trim());
        expect(headers).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(4));
      });

      it('renders the modification values in their columns', () => {
        const mods = [makeMod('Mod A', makeDensity({ barometricPressure: 30.5, gasType: 'OTHER', gasDensity: 0.06 }))];
        setup(makeFsat(makeDensity(), mods), { printView: true });

        expect(cellText(ROW.barometricPressure, 2)).toBe('30.5');
        expect(cellText(ROW.gasType, 2)).toBe('OTHER');
        expect(cellText(ROW.gasDensity, 2)).toBe('0.06');
      });
    });

    describe('dry bulb temperature unit label', () => {
      it('shows the Fahrenheit symbol for Imperial settings', () => {
        setup(makeFsat(makeDensity(), []), { printView: true, settings: makeSettings('Imperial') });
        const label = cellText(ROW.dryBulb, 0);
        expect(label).toContain(FAHRENHEIT);
        expect(label).not.toContain(CELSIUS);
      });

      it('shows the Celsius symbol for Metric settings', () => {
        setup(makeFsat(makeDensity(), []), { printView: true, settings: makeSettings('Metric') });
        const label = cellText(ROW.dryBulb, 0);
        expect(label).toContain(CELSIUS);
        expect(label).not.toContain(FAHRENHEIT);
      });

      it('shows neither symbol for any other unit system', () => {
        setup(makeFsat(makeDensity(), []), { printView: true, settings: makeSettings('Other') });
        const label = cellText(ROW.dryBulb, 0);
        expect(label).not.toContain(FAHRENHEIT);
        expect(label).not.toContain(CELSIUS);
      });
    });

    describe('method to establish gas density', () => {
      const labels: Array<[string, string]> = [
        ['relativeHumidity', 'Relative Humidity'],
        ['dewPoint', 'Dew Point'],
        ['wetBulb', 'Wet Bulb'],
        ['custom', 'Custom Density'],
        ['somethingElse', 'somethingElse'],
      ];
      labels.forEach(([inputType, label]) => {
        it(`displays ${label} for baseline and modification input type ${inputType}`, () => {
          const mods = [makeMod('Mod A', makeDensity({ inputType }))];
          setup(makeFsat(makeDensity({ inputType }), mods), { printView: true });
          expect(cellText(ROW.inputType, 1)).toBe(label);
          expect(cellText(ROW.inputType, 2)).toBe(label);
        });
      });
    });

    describe('baseline values hidden by input type', () => {
      it('shows dry bulb and static pressure values and dashes for the other fields when type is relativeHumidity', () => {
        setup(makeFsat(makeDensity({ inputType: 'relativeHumidity' }), []), { printView: true });
        expect(cellText(ROW.dryBulb, 1)).toBe('68');
        expect(cellText(ROW.staticPressure, 1)).toBe('-1.5');
        expect(cellText(ROW.relativeHumidity, 1)).toBe('40');
        expect(cellText(ROW.wetBulb, 1)).toContain(DASH);
        expect(cellText(ROW.dewPoint, 1)).toContain(DASH);
      });

      it('shows the wet bulb value and dashes for relative humidity and dew point when type is wetBulb', () => {
        setup(makeFsat(makeDensity({ inputType: 'wetBulb' }), []), { printView: true });
        expect(cellText(ROW.wetBulb, 1)).toBe('55');
        expect(cellText(ROW.relativeHumidity, 1)).toContain(DASH);
        expect(cellText(ROW.dewPoint, 1)).toContain(DASH);
      });

      it('shows the dew point value and dashes for relative humidity and wet bulb when type is dewPoint', () => {
        setup(makeFsat(makeDensity({ inputType: 'dewPoint' }), []), { printView: true });
        expect(cellText(ROW.dewPoint, 1)).toBe('45');
        expect(cellText(ROW.relativeHumidity, 1)).toContain(DASH);
        expect(cellText(ROW.wetBulb, 1)).toContain(DASH);
      });

      it('shows dashes for dry bulb, static pressure, wet bulb, relative humidity and dew point when type is custom', () => {
        setup(makeFsat(makeDensity({ inputType: 'custom' }), []), { printView: true });
        [ROW.dryBulb, ROW.staticPressure, ROW.wetBulb, ROW.relativeHumidity, ROW.dewPoint].forEach(row => {
          expect(cellText(row, 1)).toContain(DASH);
        });
      });

      it('shows the dry bulb and static pressure values when type is not custom', () => {
        setup(makeFsat(makeDensity({ inputType: 'wetBulb' }), []), { printView: true });
        expect(cellText(ROW.dryBulb, 1)).not.toContain(DASH);
        expect(cellText(ROW.staticPressure, 1)).not.toContain(DASH);
      });
    });

    describe('modification values hidden by input type', () => {
      it('shows dashes for the modification when its type is custom', () => {
        const mods = [makeMod('Mod A', makeDensity({ inputType: 'custom' }))];
        setup(makeFsat(makeDensity({ inputType: 'relativeHumidity' }), mods), { printView: true });
        [ROW.dryBulb, ROW.staticPressure, ROW.wetBulb, ROW.relativeHumidity, ROW.dewPoint].forEach(row => {
          expect(cellText(row, 2)).toContain(DASH);
        });
      });

      it('shows the matching value and dashes for the others when the modification type is wetBulb', () => {
        const mods = [makeMod('Mod A', makeDensity({ inputType: 'wetBulb', wetBulbTemp: 52 }))];
        setup(makeFsat(makeDensity({ inputType: 'relativeHumidity' }), mods), { printView: true });
        expect(cellText(ROW.dryBulb, 2)).toBe('68');
        expect(cellText(ROW.staticPressure, 2)).toBe('-1.5');
        expect(cellText(ROW.wetBulb, 2)).toBe('52');
        expect(cellText(ROW.relativeHumidity, 2)).toContain(DASH);
        expect(cellText(ROW.dewPoint, 2)).toContain(DASH);
      });

      it('shows the relative humidity value when the modification type is relativeHumidity', () => {
        const mods = [makeMod('Mod A', makeDensity({ inputType: 'relativeHumidity', relativeHumidity: 55 }))];
        setup(makeFsat(makeDensity({ inputType: 'custom' }), mods), { printView: true });
        expect(cellText(ROW.relativeHumidity, 2)).toBe('55');
        expect(cellText(ROW.wetBulb, 2)).toContain(DASH);
        expect(cellText(ROW.dewPoint, 2)).toContain(DASH);
      });

      it('shows the dew point value when the modification type is dewPoint', () => {
        const mods = [makeMod('Mod A', makeDensity({ inputType: 'dewPoint', dewPoint: 41 }))];
        setup(makeFsat(makeDensity({ inputType: 'custom' }), mods), { printView: true });
        expect(cellText(ROW.dewPoint, 2)).toBe('41');
        expect(cellText(ROW.relativeHumidity, 2)).toContain(DASH);
        expect(cellText(ROW.wetBulb, 2)).toContain(DASH);
      });
    });
  });

  describe('difference highlighting', () => {
    it('highlights the label and baseline cells of a row whose modification value differs', () => {
      const mods = [makeMod('Mod A', makeDensity({ barometricPressure: 31 }))];
      setup(makeFsat(makeDensity(), mods), { printView: true });
      fixture.detectChanges();

      expect(component.barometricPressureDiff[0]).toBeTrue();
      expect(cell(ROW.barometricPressure, 0).classList).toContain('indicate-report-field-different');
      expect(cell(ROW.barometricPressure, 1).classList).toContain('indicate-report-field-different');
      expect(cell(ROW.barometricPressure, 2).classList).toContain('indicate-report-field-different');
    });

    it('does not highlight rows whose modification value matches the baseline', () => {
      const mods = [makeMod('Mod A', makeDensity({ barometricPressure: 31 }))];
      setup(makeFsat(makeDensity(), mods), { printView: true });

      [0, 1, 2].forEach(col => {
        expect(cell(ROW.gasType, col).classList).not.toContain('indicate-report-field-different');
      });
    });

    it('highlights nothing when there are no modifications', () => {
      setup(makeFsat(makeDensity(), []), { printView: true });
      expect(host.querySelector('.indicate-report-field-different')).toBeNull();
    });
  });
});
