import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { FanMotorSummaryComponent } from './fan-motor-summary.component';
import { FanMotor, FSAT, Modification } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const DASH = '—';
const SPECIFIED_EFFICIENCY_CLASS = 3;

const ROW = {
  lineFrequency: 0,
  motorRatedPower: 1,
  motorRpm: 2,
  efficiencyClass: 3,
  specifiedEfficiency: 4,
  motorRatedVoltage: 5,
  fullLoadAmps: 6,
};

function efficiencyClassDisplay(value: number): string {
  return motorEfficiencyConstants.find(c => c.value === value).display;
}

function makeMotor(overrides: Partial<FanMotor> = {}): FanMotor {
  return {
    lineFrequency: 60,
    motorRatedPower: 200,
    motorRpm: 1780,
    efficiencyClass: 1,
    specifiedEfficiency: 95,
    motorRatedVoltage: 460,
    fullLoadAmps: 225.6,
    ...overrides,
  };
}

function makeMod(name: string, motor?: FanMotor): Modification {
  return { id: name, fsat: { name, fanMotor: motor } as FSAT };
}

function makeFsat(baseline: FanMotor, modifications?: Modification[]): FSAT {
  return { fanMotor: baseline, modifications } as FSAT;
}

describe('FanMotorSummaryComponent', () => {
  let component: FanMotorSummaryComponent;
  let fixture: ComponentFixture<FanMotorSummaryComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [FanMotorSummaryComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function setup(fsat: FSAT, options: { printView?: boolean; expanded?: boolean } = {}): void {
    fixture = TestBed.createComponent(FanMotorSummaryComponent);
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
      setup(makeFsat(makeMotor(), []));
      expect(component).toBeTruthy();
    });

    it('counts the modifications on the assessment', () => {
      setup(makeFsat(makeMotor(), [makeMod('A', makeMotor()), makeMod('B', makeMotor())]));
      expect(component.numMods).toBe(2);
    });
  });

  describe('user actions', () => {
    it('expands the table when the card header is clicked', () => {
      setup(makeFsat(makeMotor(), []));
      expect(host.querySelector('table')).toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).not.toBeNull();
    });

    it('collapses the table when the card header is clicked again', () => {
      setup(makeFsat(makeMotor(), []), { expanded: true });
      expect(host.querySelector('table')).not.toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).toBeNull();
    });
  });

  describe('template visibility', () => {
    describe('collapse / printView', () => {
      it('hides the table when collapsed and not in print view', () => {
        setup(makeFsat(makeMotor(), []));
        expect(host.querySelector('.card-body')).toBeNull();
        expect(host.querySelector('table')).toBeNull();
      });

      it('shows the table when expanded', () => {
        setup(makeFsat(makeMotor(), []), { expanded: true });
        expect(host.querySelector('.card-body')).not.toBeNull();
        expect(host.querySelector('table')).not.toBeNull();
      });

      it('shows the table when collapsed but in print view', () => {
        setup(makeFsat(makeMotor(), []), { printView: true });
        expect(component.collapse).toBeTrue();
        expect(host.querySelector('table')).not.toBeNull();
      });
    });

    describe('modification columns', () => {
      it('renders only the label and baseline columns when there are no modifications', () => {
        setup(makeFsat(makeMotor(), []), { printView: true });
        expect(host.querySelectorAll('thead th').length).toBe(2);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(2));
      });

      it('renders one header and one cell per row for each modification', () => {
        const mods = [makeMod('Mod A', makeMotor()), makeMod('Mod B', makeMotor())];
        setup(makeFsat(makeMotor(), mods), { printView: true });

        const headers = Array.from(host.querySelectorAll('thead th')).map(th => th.textContent.trim());
        expect(headers).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(4));
      });

      it('renders the baseline and modification values in their columns', () => {
        const mods = [makeMod('Mod A', makeMotor({ lineFrequency: 50, motorRatedPower: 250, motorRpm: 1185, motorRatedVoltage: 575 }))];
        setup(makeFsat(makeMotor(), mods), { printView: true });

        expect(cellText(ROW.lineFrequency, 1)).toBe('60');
        expect(cellText(ROW.lineFrequency, 2)).toBe('50');
        expect(cellText(ROW.motorRatedPower, 1)).toBe('200');
        expect(cellText(ROW.motorRatedPower, 2)).toBe('250');
        expect(cellText(ROW.motorRpm, 2)).toBe('1185');
        expect(cellText(ROW.motorRatedVoltage, 2)).toBe('575');
      });

      it('rounds full load amps to a whole number for baseline and modification', () => {
        const mods = [makeMod('Mod A', makeMotor({ fullLoadAmps: 180.4 }))];
        setup(makeFsat(makeMotor({ fullLoadAmps: 225.6 }), mods), { printView: true });

        expect(cellText(ROW.fullLoadAmps, 1)).toBe('226');
        expect(cellText(ROW.fullLoadAmps, 2)).toBe('180');
      });
    });

    describe('efficiency class', () => {
      it('shows the display name of the baseline and modification efficiency classes', () => {
        const mods = [makeMod('Mod A', makeMotor({ efficiencyClass: 0 }))];
        setup(makeFsat(makeMotor({ efficiencyClass: 1 }), mods), { printView: true });

        expect(cellText(ROW.efficiencyClass, 1)).toBe(efficiencyClassDisplay(1));
        expect(cellText(ROW.efficiencyClass, 2)).toBe(efficiencyClassDisplay(0));
      });

      it('shows an empty cell when the efficiency class is unknown', () => {
        setup(makeFsat(makeMotor({ efficiencyClass: 99 }), []), { printView: true });
        expect(cellText(ROW.efficiencyClass, 1)).toBe('');
      });
    });

    describe('specified efficiency', () => {
      it('shows the baseline value when the efficiency class is Specified', () => {
        setup(makeFsat(makeMotor({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 93.5 }), []), { printView: true });
        expect(cellText(ROW.specifiedEfficiency, 1)).toBe('93.5');
      });

      it('shows a dash instead of the baseline value when the efficiency class is not Specified', () => {
        setup(makeFsat(makeMotor({ efficiencyClass: 1, specifiedEfficiency: 93.5 }), []), { printView: true });
        expect(cellText(ROW.specifiedEfficiency, 1)).toContain(DASH);
        expect(cellText(ROW.specifiedEfficiency, 1)).not.toContain('93.5');
      });

      it('shows the modification value when its efficiency class is Specified', () => {
        const mods = [makeMod('Mod A', makeMotor({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 96 }))];
        setup(makeFsat(makeMotor({ efficiencyClass: 1 }), mods), { printView: true });
        expect(cellText(ROW.specifiedEfficiency, 2)).toBe('96');
      });

      it('shows a dash instead of the modification value when its efficiency class is not Specified', () => {
        const mods = [makeMod('Mod A', makeMotor({ efficiencyClass: 0, specifiedEfficiency: 96 }))];
        setup(makeFsat(makeMotor({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), mods), { printView: true });
        expect(cellText(ROW.specifiedEfficiency, 2)).toContain(DASH);
        expect(cellText(ROW.specifiedEfficiency, 2)).not.toContain('96');
      });
    });
  });

  describe('difference highlighting', () => {
    it('highlights the label, baseline and modification cells of a row whose modification value differs', () => {
      const mods = [makeMod('Mod A', makeMotor({ motorRpm: 3560 }))];
      setup(makeFsat(makeMotor(), mods), { printView: true });
      fixture.detectChanges();

      expect(component.motorRpmDiff[0]).toBeTrue();
      [0, 1, 2].forEach(col => {
        expect(cell(ROW.motorRpm, col).classList).toContain('indicate-report-field-different');
      });
    });

    it('does not highlight rows whose modification value matches the baseline', () => {
      const mods = [makeMod('Mod A', makeMotor({ motorRpm: 3560 }))];
      setup(makeFsat(makeMotor(), mods), { printView: true });
      fixture.detectChanges();

      [0, 1, 2].forEach(col => {
        expect(cell(ROW.lineFrequency, col).classList).not.toContain('indicate-report-field-different');
      });
    });

    it('highlights nothing when there are no modifications', () => {
      setup(makeFsat(makeMotor(), []), { printView: true });
      expect(host.querySelector('.indicate-report-field-different')).toBeNull();
    });
  });
});
