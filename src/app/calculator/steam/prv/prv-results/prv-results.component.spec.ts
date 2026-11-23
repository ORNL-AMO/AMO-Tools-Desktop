import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PrvResultsComponent } from './prv-results.component';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../settings/settings.service';
import { PrvOutput } from '../../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeResults(overrides: Partial<PrvOutput> = {}): PrvOutput {
  return {
    inletPressure: 100, inletTemperature: 400, inletSpecificEnthalpy: 1200, inletSpecificEntropy: 1.5,
    inletQuality: 1, inletMassFlow: 30, inletEnergyFlow: 36, inletVolume: 1,
    outletPressure: 50, outletTemperature: 350, outletSpecificEnthalpy: 1150, outletSpecificEntropy: 1.6,
    outletQuality: 0, outletMassFlow: 32, outletEnergyFlow: 37, outletVolume: 1,
    feedwaterPressure: 120, feedwaterTemperature: 220, feedwaterSpecificEnthalpy: 190, feedwaterSpecificEntropy: 0.32,
    feedwaterQuality: 0.55, feedwaterMassFlow: 2, feedwaterEnergyFlow: 0.4, feedwaterVolume: 1,
    ...overrides
  };
}

describe('PrvResultsComponent', () => {
  let component: PrvResultsComponent;
  let fixture: ComponentFixture<PrvResultsComponent>;

  function rows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function rowCells(index: number): string[] {
    return Array.from(rows()[index].querySelectorAll('td') as NodeListOf<HTMLElement>).map(td => td.textContent.trim().replace(/\s+/g, ' '));
  }

  function createComponent(results: PrvOutput): void {
    fixture = TestBed.createComponent(PrvResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('results', results);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [PrvResultsComponent],
      providers: [ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('feedwater column', () => {
    it('shows the feedwater column in every row when there is feedwater mass flow', () => {
      createComponent(makeResults());
      rows().forEach((row, index) => expect(rowCells(index).length).withContext(`row ${index}`).toBe(4));
      expect(rowCells(0)[3]).toBe('Feedwater');
      expect(rowCells(1)[3]).toBe('120');
      expect(rowCells(2)[3]).toBe('220');
      expect(rowCells(3)[3]).toBe('190');
      expect(rowCells(4)[3]).toBe('0.32');
      expect(rowCells(6)[3]).toBe('2');
      expect(rowCells(7)[3]).toBe('0.4');
    });

    it('hides the feedwater column in every row without feedwater mass flow', () => {
      createComponent(makeResults({ feedwaterMassFlow: 0 }));
      rows().forEach((row, index) => expect(rowCells(index).length).withContext(`row ${index}`).toBe(3));
    });
  });

  describe('values', () => {
    it('renders inlet and outlet values', () => {
      createComponent(makeResults());
      expect(rowCells(0).slice(0, 3)).toEqual(['', 'Steam In', 'Steam Out']);
      expect(rowCells(1).slice(1, 3)).toEqual(['100', '50']);
      expect(rowCells(6).slice(1, 3)).toEqual(['30', '32']);
    });
  });

  describe('quality', () => {
    [
      { quality: 0, text: 'Liquid' },
      { quality: 1, text: 'Gas' },
      { quality: 0.456, text: '0.46' },
    ].forEach(({ quality, text }) => {
      it(`shows ${text} for quality ${quality} in each column`, () => {
        createComponent(makeResults({ inletQuality: quality, outletQuality: quality, feedwaterQuality: quality }));
        const cells = Array.from(rows()[5].querySelectorAll('td') as NodeListOf<HTMLElement>).slice(1);
        expect(cells.length).toBe(3);
        cells.forEach(cell => {
          expect(cell.querySelectorAll('span').length).toBe(1);
          expect(cell.textContent.trim()).toBe(text);
        });
      });
    });
  });

  describe('copy table', () => {
    it('stores the table text for export', () => {
      createComponent(makeResults());
      component.updateTable0String();
      expect(component.table0String).toContain('Steam In');
    });
  });
});
