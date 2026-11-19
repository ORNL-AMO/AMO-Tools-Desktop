import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LossView } from '../../models/views';
import { EnergySourceChangeDialogComponent, EnergySourceChangeDialogData } from './energy-source-change-dialog.component';

function makeData(overrides: Partial<EnergySourceChangeDialogData> = {}): EnergySourceChangeDialogData {
  return {
    scenarioName: 'Baseline',
    fromEnergySource: 'Fuel-fired',
    toEnergySource: 'Electrotechnology (Electrical Infrared)',
    hiddenTabs: [{ view: LossView.FLUE_GAS, label: 'Flue Gas' }],
    addedTabs: [{ view: LossView.ENERGY_INPUT_EXHAUST_GAS, label: 'Energy Input Exhaust Gas' }],
    hasInheritingModifications: true,
    keptEnergySources: [],
    ...overrides,
  };
}

describe('EnergySourceChangeDialogComponent', () => {
  let fixture: ComponentFixture<EnergySourceChangeDialogComponent>;
  let dialogRef: jasmine.SpyObj<DialogRef>;

  function createComponent(data: EnergySourceChangeDialogData): void {
    TestBed.configureTestingModule({
      imports: [EnergySourceChangeDialogComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: data },
      ],
    });
    fixture = TestBed.createComponent(EnergySourceChangeDialogComponent);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function tabLabels(tableSelector: string): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll(`${tableSelector} tbody td`), (cell: HTMLElement) => cell.textContent.trim());
  }

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj<DialogRef>('DialogRef', ['close']);
  });

  describe('template', () => {
    it('names the scenario and both energy sources', () => {
      createComponent(makeData());

      expect(query('.modal-title').textContent).toContain('Baseline');
      expect(query('.question').textContent).toMatch(/Fuel-fired.*Electrotechnology \(Electrical Infrared\)/s);
    });

    it('lists the hidden and added tabs', () => {
      createComponent(makeData());

      expect(tabLabels('.hidden-tabs')).toEqual(['Flue Gas']);
      expect(tabLabels('.added-tabs')).toEqual(['Energy Input Exhaust Gas']);
    });

    it('shows None in a table with no tabs', () => {
      createComponent(makeData({ hiddenTabs: [] }));

      expect(tabLabels('.hidden-tabs')).toEqual(['None']);
      expect(tabLabels('.added-tabs')).toEqual(['Energy Input Exhaust Gas']);
    });

    it('omits the tab tables when no tabs change', () => {
      createComponent(makeData({ hiddenTabs: [], addedTabs: [] }));

      expect(query('.tab-changes')).toBeNull();
    });

    it('asks to complete the added tabs when tabs are added', () => {
      createComponent(makeData());

      expect(query('.required-step')).not.toBeNull();
    });

    it('omits the complete tabs step when no tabs are added', () => {
      createComponent(makeData({ addedTabs: [] }));

      expect(query('.required-step')).toBeNull();
    });

    it('notes that hidden tab data is kept when tabs are hidden', () => {
      createComponent(makeData());

      expect(query('.hidden-tabs-note')).not.toBeNull();
    });

    it('omits the hidden tab note when no tabs are hidden', () => {
      createComponent(makeData({ hiddenTabs: [] }));

      expect(query('.hidden-tabs-note')).toBeNull();
    });

    it('notes that inheriting modifications also switch', () => {
      createComponent(makeData());

      expect(query('.inheriting-modifications')).not.toBeNull();
    });

    it('omits the modification note when no modification inherits the change', () => {
      createComponent(makeData({ hasInheritingModifications: false }));

      expect(query('.inheriting-modifications')).toBeNull();
    });

    it('lists the modifications with their own energy source selection', () => {
      createComponent(makeData({
        keptEnergySources: [
          { modificationName: 'Scenario 2', energySource: 'Electrotechnology (Electric Arc Furnace (EAF))' },
          { modificationName: 'Scenario 3', energySource: 'Steam-based' },
        ],
      }));

      const rows = Array.from(fixture.nativeElement.querySelectorAll('.kept-energy-sources tbody tr'), (row: HTMLTableRowElement) =>
        Array.from(row.cells, cell => cell.textContent.trim()));
      expect(query('.kept-energy-sources caption').textContent.trim()).toBe('These modifications have their own energy source selection and will not change');
      expect(rows).toEqual([['Scenario 2', 'Electrotechnology (Electric Arc Furnace (EAF))'], ['Scenario 3', 'Steam-based']]);
      expect(query('.change-notes .kept-energy-sources')).toBeNull();
    });

    it('omits the list when no modification has its own energy source selection', () => {
      createComponent(makeData());

      expect(query('.kept-energy-sources')).toBeNull();
    });
  });

  describe('close', () => {
    it('closes with true when confirmed', () => {
      createComponent(makeData());

      query('.modal-footer .btn-primary').click();

      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('closes with no result when cancelled', () => {
      createComponent(makeData());

      query('.modal-footer .btn-white').click();
      query('.modal-header .close').click();

      expect(dialogRef.close.calls.allArgs()).toEqual([[undefined], [undefined]]);
    });
  });
});
