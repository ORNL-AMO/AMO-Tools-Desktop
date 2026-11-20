import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { SaturatedPropertiesTableComponent } from './saturated-properties-table.component';
import { SteamService } from '../../steam.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

type SaturatedRow = SaturatedPropertiesTableComponent['data'];

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamSpecificVolumeMeasurement: 'ft3lb',
} as Settings;

function makeRow(pressure: number): SaturatedRow {
  return {
    pressure: pressure,
    temperature: 337.987,
    satLiquidEnthalpy: 308.555,
    evapEnthalpy: 879.777,
    satGasEnthalpy: 1188.333,
    satLiquidEntropy: 0.48765,
    evapEntropy: 1.11555,
    satGasEntropy: 1.60321,
    satLiquidVolume: 0.01788,
    evapVolume: 4.41431,
    satGasVolume: 4.43219,
  };
}

const EXPECTED_CELLS = ['337.99', '308.56', '879.78', '1,188.33', '0.4877', '1.1156', '1.6032', '0.0179', '4.4143', '4.4322', 'Delete'];

describe('SaturatedPropertiesTableComponent', () => {
  let component: SaturatedPropertiesTableComponent;
  let fixture: ComponentFixture<SaturatedPropertiesTableComponent>;
  let steamServiceMock: Partial<SteamService>;

  function bodyRows(): Array<HTMLTableRowElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function cellTexts(row: HTMLTableRowElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim());
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(SaturatedPropertiesTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('toggleResetData', true);
    fixture.componentRef.setInput('toggleExampleData', true);
    fixture.componentRef.setInput('data', undefined);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceMock = { saturatedPropertiesData: undefined };
    await TestBed.configureTestingModule({
      declarations: [SaturatedPropertiesTableComponent, SettingsLabelStubPipe],
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
      steamServiceMock.saturatedPropertiesData = [makeRow(10), makeRow(20)];
      createComponent();
      expect(bodyRows().length).toBe(2);
    });
  });

  describe('row rendering', () => {
    it('formats every cell of a row', () => {
      steamServiceMock.saturatedPropertiesData = [makeRow(101.23456)];
      createComponent();
      const cells = cellTexts(bodyRows()[0]);
      expect(cells[0]).toBe('101.2346');
      expect(cells.slice(1)).toEqual(EXPECTED_CELLS);
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
      fixture.componentRef.setInput('toggleResetData', false);
      fixture.detectChanges();
      expect(bodyRows().length).toBe(0);
      expect(steamServiceMock.saturatedPropertiesData).toEqual([]);
    });

    it('does not add a row when the example toggle changes', () => {
      fixture.componentRef.setInput('toggleExampleData', false);
      fixture.detectChanges();
      expect(bodyRows().length).toBe(0);
    });
  });

  describe('user actions', () => {
    it('deletes the clicked row and keeps the others in order', () => {
      steamServiceMock.saturatedPropertiesData = [makeRow(1), makeRow(2), makeRow(3)];
      createComponent();
      const secondRow = bodyRows()[1];
      (secondRow.querySelector('.delete-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(bodyRows().map(row => cellTexts(row)[0])).toEqual(['1', '3']);
    });

    it('shows the remaining row values after deleting the first row', () => {
      steamServiceMock.saturatedPropertiesData = [makeRow(1), makeRow(2)];
      createComponent();
      (bodyRows()[0].querySelector('.delete-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(bodyRows().length).toBe(1);
      expect(cellTexts(bodyRows()[0])[0]).toBe('2');
    });
  });

  describe('destroy', () => {
    it('saves the rows to the service', () => {
      createComponent();
      fixture.componentRef.setInput('data', makeRow(7));
      fixture.detectChanges();
      fixture.destroy();
      expect(steamServiceMock.saturatedPropertiesData.length).toBe(1);
      expect(steamServiceMock.saturatedPropertiesData[0].pressure).toBe(7);
    });
  });
});
