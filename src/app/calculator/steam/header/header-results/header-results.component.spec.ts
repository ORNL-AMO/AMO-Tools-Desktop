import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HeaderResultsComponent } from './header-results.component';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../settings/settings.service';
import { HeaderOutput, SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeProps(pressure: number, quality: number = 1): SteamPropertiesOutput {
  return {
    pressure, temperature: pressure + 300, quality, massFlow: pressure / 10,
    specificEnthalpy: 1200, specificEntropy: 1.5, energyFlow: 30, specificVolume: 1
  };
}

function makeResults(qualities: { [key: string]: number } = {}): HeaderOutput {
  const results: any = { header: makeProps(100, qualities.header ?? 1) };
  for (let i = 1; i <= 9; i++) {
    results['inlet' + i] = makeProps(100 + i, qualities['inlet' + i] ?? 1);
  }
  return results as HeaderOutput;
}

describe('HeaderResultsComponent', () => {
  let component: HeaderResultsComponent;
  let fixture: ComponentFixture<HeaderResultsComponent>;

  function rowCells(index: number): HTMLElement[] {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    return Array.from(rows[index].querySelectorAll('td') as NodeListOf<HTMLElement>).slice(1);
  }

  function rowText(index: number): string[] {
    return rowCells(index).map(td => td.textContent.trim());
  }

  function createComponent(results: HeaderOutput, numberOfInlets: number): void {
    fixture = TestBed.createComponent(HeaderResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('results', results);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('numberOfInlets', numberOfInlets);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [HeaderResultsComponent],
      providers: [ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('getResultsData', () => {
    it('puts the header first followed by the requested inlets', () => {
      createComponent(makeResults(), 2);
      expect(component.resultsArray.map(r => r.pressure)).toEqual([100, 101, 102]);
    });

    it('rebuilds the array when the inlet count changes', () => {
      createComponent(makeResults(), 2);
      fixture.componentRef.setInput('numberOfInlets', 4);
      fixture.detectChanges();
      expect(component.resultsArray.length).toBe(5);
    });
  });

  describe('table columns', () => {
    it('labels the first column Header and the rest by inlet', () => {
      createComponent(makeResults(), 3);
      expect(rowText(0)).toEqual(['Header', 'Inlet 1', 'Inlet 2', 'Inlet 3']);
      rowCells(0).forEach(cell => expect(cell.querySelectorAll('span').length).toBe(1));
    });

    it('renders one value column per result in every row', () => {
      createComponent(makeResults(), 2);
      for (let row = 0; row < 8; row++) {
        expect(rowCells(row).length).withContext(`row ${row}`).toBe(3);
      }
      expect(rowText(1)).toEqual(['100', '101', '102']);
      expect(rowText(4)).toEqual(['10', '10.1', '10.2']);
    });

    it('renders only the header column with no inlets', () => {
      createComponent(makeResults(), 0);
      expect(rowText(0)).toEqual(['Header']);
    });
  });

  describe('phase row', () => {
    [
      { quality: 0, text: 'Liquid' },
      { quality: 1, text: 'Gas' },
      { quality: 0.456, text: '0.46' },
    ].forEach(({ quality, text }) => {
      it(`shows ${text} for quality ${quality}`, () => {
        createComponent(makeResults({ header: quality, inlet1: quality }), 1);
        rowCells(3).forEach(cell => {
          expect(cell.querySelectorAll('span').length).toBe(1);
          expect(cell.textContent.trim()).toBe(text);
        });
      });
    });
  });

  describe('copy table', () => {
    it('stores the table text for export', () => {
      createComponent(makeResults(), 1);
      component.updateTableString();
      expect(component.tableString).toContain('Inlet 1');
    });
  });
});
