import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { SteamPropertiesTableComponent } from './steam-properties-table.component';
import { SteamService } from '../../steam.service';
import { Settings } from '../../../../shared/models/settings';
import { ThermodynamicQuantity } from '../../../../shared/models/steam/steam-inputs';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

type SteamRow = SteamPropertiesTableComponent['data'];

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamSpecificVolumeMeasurement: 'ft3lb',
} as Settings;

function makeRow(pressure: number, quality: number = 1, quantity: number = ThermodynamicQuantity.TEMPERATURE): SteamRow {
  return {
    pressure: pressure,
    thermodynamicQuantity: quantity,
    temperature: 337.987,
    enthalpy: 1188.333,
    entropy: 1.60321,
    volume: 4.43219,
    quality: quality,
  };
}

describe('SteamPropertiesTableComponent', () => {
  let component: SteamPropertiesTableComponent;
  let fixture: ComponentFixture<SteamPropertiesTableComponent>;
  let steamServiceMock: Partial<SteamService>;

  function bodyRows(): Array<HTMLTableRowElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function cellTexts(row: HTMLTableRowElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim());
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(SteamPropertiesTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('toggleResetData', false);
    fixture.componentRef.setInput('toggleExampleData', false);
    fixture.componentRef.setInput('data', undefined);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceMock = { steamPropertiesData: undefined };
    await TestBed.configureTestingModule({
      declarations: [SteamPropertiesTableComponent, SettingsLabelStubPipe],
      providers: [{ provide: SteamService, useValue: steamServiceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('renders no body rows when the service has no saved rows', () => {
      createComponent();
      expect(component.rowData).toEqual([]);
      expect(bodyRows().length).toBe(0);
    });

    it('renders the rows saved on the service', () => {
      steamServiceMock.steamPropertiesData = [makeRow(10), makeRow(20)];
      createComponent();
      expect(bodyRows().length).toBe(2);
    });
  });

  describe('row rendering', () => {
    it('formats every cell of a row', () => {
      steamServiceMock.steamPropertiesData = [makeRow(101.23456)];
      createComponent();
      expect(cellTexts(bodyRows()[0])).toEqual(['101.2346', '337.99', '1,188.33', '1.6032', 'Gas', 'Temperature', '4.4322', 'Delete']);
    });

    const qualityCases = [
      { quality: 0, text: 'Liquid' },
      { quality: 1, text: 'Gas' },
      { quality: 0.456, text: '0.46' },
    ];
    qualityCases.forEach(testCase => {
      it(`shows only "${testCase.text}" in the quality cell for quality ${testCase.quality}`, () => {
        steamServiceMock.steamPropertiesData = [makeRow(1, testCase.quality)];
        createComponent();
        const spans = bodyRows()[0].querySelectorAll('td')[4].querySelectorAll('span');
        expect(spans.length).toBe(1);
        expect(spans[0].textContent.trim()).toBe(testCase.text);
      });
    });

    const quantityCases = [
      { quantity: ThermodynamicQuantity.TEMPERATURE, text: 'Temperature' },
      { quantity: ThermodynamicQuantity.ENTHALPY, text: 'Specific Enthalpy' },
      { quantity: ThermodynamicQuantity.ENTROPY, text: 'Specific Entropy' },
      { quantity: ThermodynamicQuantity.QUALITY, text: 'Saturated Quality' },
    ];
    quantityCases.forEach(testCase => {
      it(`renders a single "${testCase.text}" known variable cell`, () => {
        steamServiceMock.steamPropertiesData = [makeRow(1, 1, testCase.quantity)];
        createComponent();
        const cells = cellTexts(bodyRows()[0]);
        expect(cells.length).toBe(8);
        expect(cells[5]).toBe(testCase.text);
      });
    });

    it('omits the known variable cell for an unknown quantity', () => {
      steamServiceMock.steamPropertiesData = [makeRow(1, 1, 9)];
      createComponent();
      expect(cellTexts(bodyRows()[0]).length).toBe(7);
    });
  });

  describe('input changes', () => {
    beforeEach(() => createComponent());

    it('appends a row when new data arrives', () => {
      fixture.componentRef.setInput('data', makeRow(5));
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeRow(6));
      fixture.detectChanges();
      expect(bodyRows().map(row => cellTexts(row)[0])).toEqual(['5', '6']);
    });

    it('ignores null data', () => {
      fixture.componentRef.setInput('data', null);
      fixture.detectChanges();
      expect(bodyRows().length).toBe(0);
    });

    it('clears the table and the service rows when reset toggles', () => {
      fixture.componentRef.setInput('data', makeRow(5));
      fixture.detectChanges();
      fixture.componentRef.setInput('toggleResetData', true);
      fixture.detectChanges();
      expect(bodyRows().length).toBe(0);
      expect(steamServiceMock.steamPropertiesData).toEqual([]);
    });

    it('does not add a row when the example toggle changes', () => {
      fixture.componentRef.setInput('toggleExampleData', true);
      fixture.detectChanges();
      expect(bodyRows().length).toBe(0);
    });
  });

  describe('user actions', () => {
    it('deletes the clicked row and keeps the others in order', () => {
      steamServiceMock.steamPropertiesData = [makeRow(1), makeRow(2), makeRow(3)];
      createComponent();
      (bodyRows()[1].querySelector('.delete-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(bodyRows().map(row => cellTexts(row)[0])).toEqual(['1', '3']);
    });

    it('shows the remaining row values after deleting the first row', () => {
      steamServiceMock.steamPropertiesData = [makeRow(1, 0), makeRow(2, 1, ThermodynamicQuantity.ENTROPY)];
      createComponent();
      (bodyRows()[0].querySelector('.delete-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(bodyRows().length).toBe(1);
      const cells = cellTexts(bodyRows()[0]);
      expect(cells[0]).toBe('2');
      expect(cells[4]).toBe('Gas');
      expect(cells[5]).toBe('Specific Entropy');
    });

    it('copies the table text without the delete labels', () => {
      steamServiceMock.steamPropertiesData = [makeRow(1)];
      createComponent();
      component.updateTableString();
      expect(component.tableString).toContain('Temperature');
      expect(component.tableString).not.toContain('Delete');
    });
  });

  describe('destroy', () => {
    it('saves the rows to the service', () => {
      createComponent();
      fixture.componentRef.setInput('data', makeRow(7));
      fixture.detectChanges();
      fixture.destroy();
      expect(steamServiceMock.steamPropertiesData.length).toBe(1);
      expect(steamServiceMock.steamPropertiesData[0].pressure).toBe(7);
    });
  });
});
