import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';

import { FanOperationsSummaryComponent } from './fan-operations-summary.component';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { FSAT, FsatOperations, Modification } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { Co2SavingsData } from '../../../../calculator/utilities/co2-savings/co2-savings.service';

const ROW = {
  operatingHours: 0,
  cost: 1,
  emissionOutputRate: 2,
};

function makeOperations(overrides: Partial<FsatOperations> = {}, emissionRate: number = 500.456): FsatOperations {
  return {
    operatingHours: 8760,
    cost: 0.12,
    cO2SavingsData: { totalEmissionOutputRate: emissionRate } as Co2SavingsData,
    ...overrides,
  };
}

function makeMod(name: string, operations?: FsatOperations): Modification {
  return { id: name, fsat: { name, fsatOperations: operations } as FSAT };
}

function makeFsat(baseline: FsatOperations, modifications?: Modification[]): FSAT {
  return { fsatOperations: baseline, modifications } as FSAT;
}

describe('FanOperationsSummaryComponent', () => {
  let component: FanOperationsSummaryComponent;
  let fixture: ComponentFixture<FanOperationsSummaryComponent>;
  let host: HTMLElement;
  let showOperationalImpacts: WritableSignal<boolean>;

  beforeEach(async () => {
    showOperationalImpacts = signal(false);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [FanOperationsSummaryComponent],
      providers: [
        { provide: FeatureFlagService, useValue: jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts }) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function setup(fsat: FSAT, options: { printView?: boolean; expanded?: boolean } = {}): void {
    fixture = TestBed.createComponent(FanOperationsSummaryComponent);
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
      setup(makeFsat(makeOperations(), []));
      expect(component).toBeTruthy();
    });

    it('counts the modifications on the assessment', () => {
      setup(makeFsat(makeOperations(), [makeMod('A', makeOperations()), makeMod('B', makeOperations())]));
      expect(component.numMods).toBe(2);
    });
  });

  describe('user actions', () => {
    it('expands the table when the card header is clicked', () => {
      setup(makeFsat(makeOperations(), []));
      expect(host.querySelector('table')).toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).not.toBeNull();
    });

    it('collapses the table when the card header is clicked again', () => {
      setup(makeFsat(makeOperations(), []), { expanded: true });
      expect(host.querySelector('table')).not.toBeNull();

      (host.querySelector('.card-header') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.querySelector('table')).toBeNull();
    });
  });

  describe('template visibility', () => {
    describe('collapse / printView', () => {
      it('hides the table when collapsed and not in print view', () => {
        setup(makeFsat(makeOperations(), []));
        expect(host.querySelector('.card-body')).toBeNull();
        expect(host.querySelector('table')).toBeNull();
      });

      it('shows the table when expanded', () => {
        setup(makeFsat(makeOperations(), []), { expanded: true });
        expect(host.querySelector('.card-body')).not.toBeNull();
        expect(host.querySelector('table')).not.toBeNull();
      });

      it('shows the table when collapsed but in print view', () => {
        setup(makeFsat(makeOperations(), []), { printView: true });
        expect(component.collapse).toBeTrue();
        expect(host.querySelector('table')).not.toBeNull();
      });
    });

    describe('modification columns', () => {
      it('renders only the label and baseline columns when there are no modifications', () => {
        setup(makeFsat(makeOperations(), []), { printView: true });
        expect(host.querySelectorAll('thead th').length).toBe(2);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(2));
      });

      it('renders one header and one cell per row for each modification', () => {
        const mods = [makeMod('Mod A', makeOperations()), makeMod('Mod B', makeOperations())];
        setup(makeFsat(makeOperations(), mods), { printView: true });

        const headers = Array.from(host.querySelectorAll('thead th')).map(th => th.textContent.trim());
        expect(headers).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
        bodyRows().forEach(row => expect(row.querySelectorAll('td').length).toBe(4));
      });

      it('renders the baseline and modification operating hours and cost', () => {
        const mods = [makeMod('Mod A', makeOperations({ operatingHours: 6000, cost: 3 }))];
        setup(makeFsat(makeOperations({ cost: 5 }), mods), { printView: true });

        expect(cellText(ROW.operatingHours, 1)).toBe('8760');
        expect(cellText(ROW.operatingHours, 2)).toBe('6000');
        expect(cellText(ROW.cost, 1)).toBe('$5');
        expect(cellText(ROW.cost, 2)).toBe('$3');
      });
    });

    describe('total emission output rate (operational impacts flag)', () => {
      it('hides the emission output rate row when operational impacts are disabled', () => {
        showOperationalImpacts.set(false);
        setup(makeFsat(makeOperations(), []), { printView: true });
        expect(bodyRows().length).toBe(2);
        expect(host.textContent).not.toContain('Total Emission Output Rate');
      });

      it('shows the emission output rate row when operational impacts are enabled', () => {
        showOperationalImpacts.set(true);
        setup(makeFsat(makeOperations({}, 500.456), []), { printView: true });
        expect(bodyRows().length).toBe(3);
        expect(cellText(ROW.emissionOutputRate, 0)).toContain('Total Emission Output Rate');
        expect(cellText(ROW.emissionOutputRate, 1)).toBe('500.46');
      });

      it('shows the emission output rate of each modification when operational impacts are enabled', () => {
        showOperationalImpacts.set(true);
        const mods = [makeMod('Mod A', makeOperations({}, 410.1)), makeMod('Mod B', makeOperations({}, 300))];
        setup(makeFsat(makeOperations({}, 500), mods), { printView: true });

        expect(cellText(ROW.emissionOutputRate, 2)).toBe('410.1');
        expect(cellText(ROW.emissionOutputRate, 3)).toBe('300');
      });

      it('shows the row once the flag is turned on after rendering', () => {
        showOperationalImpacts.set(false);
        setup(makeFsat(makeOperations(), []), { printView: true });
        expect(bodyRows().length).toBe(2);

        showOperationalImpacts.set(true);
        fixture.detectChanges();

        expect(bodyRows().length).toBe(3);
      });
    });
  });

  describe('difference highlighting', () => {
    it('highlights the label, baseline and modification cells of a row whose modification value differs', () => {
      const mods = [makeMod('Mod A', makeOperations({ operatingHours: 4000 }))];
      setup(makeFsat(makeOperations(), mods), { printView: true });
      fixture.detectChanges();

      expect(component.operatingHoursDiff[0]).toBeTrue();
      [0, 1, 2].forEach(col => {
        expect(cell(ROW.operatingHours, col).classList).toContain('indicate-report-field-different');
      });
    });

    it('does not highlight rows whose modification value matches the baseline', () => {
      const mods = [makeMod('Mod A', makeOperations({ operatingHours: 4000 }))];
      setup(makeFsat(makeOperations(), mods), { printView: true });
      fixture.detectChanges();

      [0, 1, 2].forEach(col => {
        expect(cell(ROW.cost, col).classList).not.toContain('indicate-report-field-different');
      });
    });

    it('highlights nothing when there are no modifications', () => {
      setup(makeFsat(makeOperations(), []), { printView: true });
      expect(host.querySelector('.indicate-report-field-different')).toBeNull();
    });
  });
});
