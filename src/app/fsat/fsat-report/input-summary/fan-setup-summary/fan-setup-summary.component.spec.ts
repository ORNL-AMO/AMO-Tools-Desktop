import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FanSetupSummaryComponent } from './fan-setup-summary.component';
import { FanSetup, FSAT, Modification } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { FanTypes, Drives } from '../../../fanOptions';

const DASH = '—';
const NOT_APPLICABLE_FAN_TYPE = 12;
const SPECIFIED_DRIVE = 4;

const ROW = {
  fanType: 0,
  fanSpeed: 1,
  drive: 2,
  driveEfficiency: 3,
  fanEfficiency: 4,
};

function fanTypeDisplay(value: number): string {
  return FanTypes.find(f => f.value === value).display;
}

function driveDisplay(value: number): string {
  return Drives.find(d => d.value === value).display;
}

function makeSetup(overrides: Partial<FanSetup> = {}): FanSetup {
  return {
    fanType: 0,
    fanSpeed: 1180,
    drive: 1,
    specifiedDriveEfficiency: 88,
    fanEfficiency: 72.5,
    ...overrides,
  };
}

function makeMod(name: string, setup?: FanSetup): Modification {
  return { id: name, fsat: { name, fanSetup: setup } as FSAT };
}

function makeFsat(baseline: FanSetup, modifications?: Modification[]): FSAT {
  return { fanSetup: baseline, modifications } as FSAT;
}

describe('FanSetupSummaryComponent', () => {
  let component: FanSetupSummaryComponent;
  let fixture: ComponentFixture<FanSetupSummaryComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [FanSetupSummaryComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function setup(fsat: FSAT, options: { printView?: boolean; expanded?: boolean } = {}): void {
    fixture = TestBed.createComponent(FanSetupSummaryComponent);
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
      setup(makeFsat(makeSetup(), []));
      expect(component).toBeTruthy();
    });

    it('counts the modifications on the assessment', () => {
      setup(makeFsat(makeSetup(), [makeMod('A', makeSetup()), makeMod('B', makeSetup())]));
      expect(component.numMods).toBe(2);
    });
  });

  describe('user actions', () => {
    it('expands the table when the card header is clicked', () => {
      setup(makeFsat(makeSetup(), []));
      expect(host.querySelector('table')).toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).not.toBeNull();
    });

    it('collapses the table when the card header is clicked again', () => {
      setup(makeFsat(makeSetup(), []), { expanded: true });
      expect(host.querySelector('table')).not.toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).toBeNull();
    });
  });

  describe('template visibility', () => {
    describe('collapse / printView', () => {
      it('hides the table when collapsed and not in print view', () => {
        setup(makeFsat(makeSetup(), []));
        expect(host.querySelector('.card-body')).toBeNull();
        expect(host.querySelector('table')).toBeNull();
      });

      it('shows the table when expanded', () => {
        setup(makeFsat(makeSetup(), []), { expanded: true });
        expect(host.querySelector('.card-body')).not.toBeNull();
        expect(host.querySelector('table')).not.toBeNull();
      });

      it('shows the table when collapsed but in print view', () => {
        setup(makeFsat(makeSetup(), []), { printView: true });
        expect(component.collapse).toBeTrue();
        expect(host.querySelector('table')).not.toBeNull();
      });
    });

    describe('modification columns', () => {
      it('renders only the label and baseline columns when there are no modifications', () => {
        setup(makeFsat(makeSetup(), []), { printView: true });
        expect(host.querySelectorAll('thead th').length).toBe(2);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(2));
      });

      it('renders one header and one cell per row for each modification', () => {
        const mods = [makeMod('Mod A', makeSetup()), makeMod('Mod B', makeSetup())];
        setup(makeFsat(makeSetup(), mods), { printView: true });

        const headers = Array.from(host.querySelectorAll('thead th')).map(th => th.textContent.trim());
        expect(headers).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(4));
      });

      it('renders the baseline and modification values in their columns', () => {
        const mods = [makeMod('Mod A', makeSetup({ fanType: 1, fanSpeed: 1780, drive: 0, fanEfficiency: 80 }))];
        setup(makeFsat(makeSetup(), mods), { printView: true });

        expect(cellText(ROW.fanType, 1)).toBe(fanTypeDisplay(0));
        expect(cellText(ROW.fanType, 2)).toBe(fanTypeDisplay(1));
        expect(cellText(ROW.fanSpeed, 1)).toBe('1180');
        expect(cellText(ROW.fanSpeed, 2)).toBe('1780');
        expect(cellText(ROW.drive, 1)).toBe(driveDisplay(1));
        expect(cellText(ROW.drive, 2)).toBe(driveDisplay(0));
        expect(cellText(ROW.fanEfficiency, 1)).toBe('72.5 %');
        expect(cellText(ROW.fanEfficiency, 2)).toBe('80 %');
      });
    });

    describe('modification fan type', () => {
      it('shows the fan type name when the modification fan type is not the not-applicable type', () => {
        const mods = [makeMod('Mod A', makeSetup({ fanType: 1 }))];
        setup(makeFsat(makeSetup(), mods), { printView: true });
        expect(cellText(ROW.fanType, 2)).toBe(fanTypeDisplay(1));
        expect(cellText(ROW.fanType, 2)).not.toContain(DASH);
      });

      it('shows a dash instead of a fan type name when the modification fan type is the not-applicable type', () => {
        const mods = [makeMod('Mod A', makeSetup({ fanType: NOT_APPLICABLE_FAN_TYPE }))];
        setup(makeFsat(makeSetup(), mods), { printView: true });
        expect(cellText(ROW.fanType, 2)).toContain(DASH);
      });
    });

    describe('drive efficiency', () => {
      it('shows the baseline specified drive efficiency when the drive is Specified', () => {
        setup(makeFsat(makeSetup({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: 91.25 }), []), { printView: true });
        expect(cellText(ROW.driveEfficiency, 1)).toContain('91.25 %');
      });

      it('shows a dash and no value for the baseline when the drive is not Specified', () => {
        setup(makeFsat(makeSetup({ drive: 1, specifiedDriveEfficiency: 91.25 }), []), { printView: true });
        expect(cellText(ROW.driveEfficiency, 1)).toContain(DASH);
        expect(cellText(ROW.driveEfficiency, 1)).not.toContain('91.25');
      });

      it('shows the modification specified drive efficiency when its drive is Specified', () => {
        const mods = [makeMod('Mod A', makeSetup({ drive: SPECIFIED_DRIVE, specifiedDriveEfficiency: 93 }))];
        setup(makeFsat(makeSetup(), mods), { printView: true });
        expect(cellText(ROW.driveEfficiency, 2)).toBe('93 %');
      });

      it('shows a dash and no value for the modification when its drive is not Specified', () => {
        const mods = [makeMod('Mod A', makeSetup({ drive: 0, specifiedDriveEfficiency: 93 }))];
        setup(makeFsat(makeSetup({ drive: SPECIFIED_DRIVE }), mods), { printView: true });
        expect(cellText(ROW.driveEfficiency, 2)).toContain(DASH);
        expect(cellText(ROW.driveEfficiency, 2)).not.toContain('93');
      });
    });
  });

  describe('difference highlighting', () => {
    it('highlights the label, baseline and modification cells of a row whose modification value differs', () => {
      const mods = [makeMod('Mod A', makeSetup({ fanSpeed: 1780 }))];
      setup(makeFsat(makeSetup(), mods), { printView: true });
      fixture.detectChanges();

      expect(component.fanSpeedDiff[0]).toBeTrue();
      [0, 1, 2].forEach(col => {
        expect(cell(ROW.fanSpeed, col).classList).toContain('indicate-report-field-different');
      });
    });

    it('does not highlight rows whose modification value matches the baseline', () => {
      const mods = [makeMod('Mod A', makeSetup({ fanSpeed: 1780 }))];
      setup(makeFsat(makeSetup(), mods), { printView: true });
      fixture.detectChanges();

      [0, 1, 2].forEach(col => {
        expect(cell(ROW.drive, col).classList).not.toContain('indicate-report-field-different');
      });
    });

    it('highlights nothing when there are no modifications', () => {
      setup(makeFsat(makeSetup(), []), { printView: true });
      expect(host.querySelector('.indicate-report-field-different')).toBeNull();
    });
  });
});
