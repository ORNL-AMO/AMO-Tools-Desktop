import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { FieldDataSummaryComponent } from './field-data-summary.component';
import { FieldData, FSAT, Modification } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const DASH = '—';

const ROW = {
  flowRate: 0,
  inletPressure: 1,
  outletPressure: 2,
  loadEstimatedMethod: 3,
  motorPower: 4,
  compressibilityFactor: 5,
  measuredVoltage: 6,
};

function makeFieldData(overrides: Partial<FieldData> = {}): FieldData {
  return {
    flowRate: 100000,
    inletPressure: -10,
    outletPressure: 5,
    loadEstimatedMethod: 0,
    motorPower: 150,
    compressibilityFactor: 0.99,
    measuredVoltage: 460,
    ...overrides,
  };
}

function makeMod(name: string, fieldData?: FieldData): Modification {
  return { id: name, fsat: { name, fieldData } as FSAT };
}

function makeFsat(baseline: FieldData, modifications?: Modification[]): FSAT {
  return { fieldData: baseline, modifications } as FSAT;
}

describe('FieldDataSummaryComponent', () => {
  let component: FieldDataSummaryComponent;
  let fixture: ComponentFixture<FieldDataSummaryComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [FieldDataSummaryComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function setup(fsat: FSAT, options: { printView?: boolean; expanded?: boolean } = {}): void {
    fixture = TestBed.createComponent(FieldDataSummaryComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    component.fsat = fsat;
    component.settings = { unitsOfMeasure: 'Imperial' } as Settings;
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
      setup(makeFsat(makeFieldData(), []));
      expect(component).toBeTruthy();
    });

    it('counts the modifications on the assessment', () => {
      setup(makeFsat(makeFieldData(), [makeMod('A', makeFieldData()), makeMod('B', makeFieldData())]));
      expect(component.numMods).toBe(2);
    });
  });

  describe('user actions', () => {
    it('expands the table when the card header is clicked', () => {
      setup(makeFsat(makeFieldData(), []));
      expect(host.querySelector('table')).toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).not.toBeNull();
    });

    it('collapses the table when the card header is clicked again', () => {
      setup(makeFsat(makeFieldData(), []), { expanded: true });
      expect(host.querySelector('table')).not.toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).toBeNull();
    });
  });

  describe('template visibility', () => {
    describe('collapse / printView', () => {
      it('hides the table when collapsed and not in print view', () => {
        setup(makeFsat(makeFieldData(), []));
        expect(host.querySelector('.card-body')).toBeNull();
        expect(host.querySelector('table')).toBeNull();
      });

      it('shows the table when expanded', () => {
        setup(makeFsat(makeFieldData(), []), { expanded: true });
        expect(host.querySelector('.card-body')).not.toBeNull();
        expect(host.querySelector('table')).not.toBeNull();
      });

      it('shows the table when collapsed but in print view', () => {
        setup(makeFsat(makeFieldData(), []), { printView: true });
        expect(component.collapse).toBeTrue();
        expect(host.querySelector('table')).not.toBeNull();
      });
    });

    describe('modification columns', () => {
      it('renders only the label and baseline columns when there are no modifications', () => {
        setup(makeFsat(makeFieldData(), []), { printView: true });
        expect(host.querySelectorAll('thead th').length).toBe(2);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(2));
      });

      it('renders one header and one cell per row for each modification', () => {
        const mods = [makeMod('Mod A', makeFieldData()), makeMod('Mod B', makeFieldData())];
        setup(makeFsat(makeFieldData(), mods), { printView: true });

        const headers = Array.from(host.querySelectorAll('thead th')).map(th => th.textContent.trim());
        expect(headers).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(4));
      });

      it('renders the baseline and modification values in their columns', () => {
        const mods = [makeMod('Mod A', makeFieldData({ flowRate: 90000, inletPressure: -8, outletPressure: 4, compressibilityFactor: 0.98, measuredVoltage: 480 }))];
        setup(makeFsat(makeFieldData(), mods), { printView: true });

        expect(cellText(ROW.flowRate, 1)).toBe('100000');
        expect(cellText(ROW.flowRate, 2)).toBe('90000');
        expect(cellText(ROW.inletPressure, 2)).toBe('-8');
        expect(cellText(ROW.outletPressure, 2)).toBe('4');
        expect(cellText(ROW.compressibilityFactor, 2)).toBe('0.98');
        expect(cellText(ROW.measuredVoltage, 2)).toBe('480');
      });

      it('shows dashes for the load estimated method and motor power of each modification', () => {
        const mods = [makeMod('Mod A', makeFieldData()), makeMod('Mod B', makeFieldData())];
        setup(makeFsat(makeFieldData(), mods), { printView: true });

        [ROW.loadEstimatedMethod, ROW.motorPower].forEach(row => {
          expect(cellText(row, 2)).toContain(DASH);
          expect(cellText(row, 3)).toContain(DASH);
        });
      });
    });

    describe('load estimated method', () => {
      it('shows Power and the kW motor power label when the method is 0', () => {
        setup(makeFsat(makeFieldData({ loadEstimatedMethod: 0 }), []), { printView: true });
        expect(cellText(ROW.loadEstimatedMethod, 1)).toBe('Power');
        expect(cellText(ROW.motorPower, 0)).toBe('Motor Power (kW)');
      });

      it('shows Current and the amps motor current label when the method is 1', () => {
        setup(makeFsat(makeFieldData({ loadEstimatedMethod: 1 }), []), { printView: true });
        expect(cellText(ROW.loadEstimatedMethod, 1)).toBe('Current');
        expect(cellText(ROW.motorPower, 0)).toBe('Motor Current (A)');
      });

      it('shows no method name and no motor power label when the method is neither 0 nor 1', () => {
        setup(makeFsat(makeFieldData({ loadEstimatedMethod: 2 }), []), { printView: true });
        expect(cellText(ROW.loadEstimatedMethod, 1)).toBe('');
        expect(cellText(ROW.motorPower, 0)).toBe('');
      });
    });
  });

  describe('difference highlighting', () => {
    it('highlights the label, baseline and modification cells of a row whose modification value differs', () => {
      const mods = [makeMod('Mod A', makeFieldData({ measuredVoltage: 575 }))];
      setup(makeFsat(makeFieldData(), mods), { printView: true });
      fixture.detectChanges();

      expect(component.measuredVoltageDiff[0]).toBeTrue();
      [0, 1, 2].forEach(col => {
        expect(cell(ROW.measuredVoltage, col).classList).toContain('indicate-report-field-different');
      });
    });

    it('does not highlight rows whose modification value matches the baseline', () => {
      const mods = [makeMod('Mod A', makeFieldData({ measuredVoltage: 575 }))];
      setup(makeFsat(makeFieldData(), mods), { printView: true });
      fixture.detectChanges();

      [0, 1, 2].forEach(col => {
        expect(cell(ROW.flowRate, col).classList).not.toContain('indicate-report-field-different');
      });
    });

    it('highlights nothing when there are no modifications', () => {
      setup(makeFsat(makeFieldData(), []), { printView: true });
      expect(host.querySelector('.indicate-report-field-different')).toBeNull();
    });
  });
});
