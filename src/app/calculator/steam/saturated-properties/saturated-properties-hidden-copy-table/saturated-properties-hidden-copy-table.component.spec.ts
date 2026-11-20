import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { SaturatedPropertiesHiddenCopyTableComponent } from './saturated-properties-hidden-copy-table.component';
import { SteamService } from '../../steam.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

type SaturatedRow = SaturatedPropertiesHiddenCopyTableComponent['rowData'][number];

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

describe('SaturatedPropertiesHiddenCopyTableComponent', () => {
  let component: SaturatedPropertiesHiddenCopyTableComponent;
  let fixture: ComponentFixture<SaturatedPropertiesHiddenCopyTableComponent>;

  function bodyRows(): Array<HTMLTableRowElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function createComponent(rowData: Array<SaturatedRow>): void {
    fixture = TestBed.createComponent(SaturatedPropertiesHiddenCopyTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('rowData', rowData);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaturatedPropertiesHiddenCopyTableComponent, SettingsLabelStubPipe],
      providers: [{ provide: SteamService, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('renders no body rows for an empty list', () => {
    createComponent([]);
    expect(bodyRows().length).toBe(0);
  });

  it('renders one formatted row per item without a delete cell', () => {
    createComponent([makeRow(101.23456), makeRow(2)]);
    const rows = bodyRows();
    expect(rows.length).toBe(2);
    const cells = Array.from(rows[0].querySelectorAll('td')).map(cell => cell.textContent.trim());
    expect(cells).toEqual(['101.2346', '337.99', '308.56', '879.78', '1,188.33', '0.4877', '1.1156', '1.6032', '0.0179', '4.4143', '4.4322']);
    expect(rows[1].querySelector('td').textContent.trim()).toBe('2');
  });

  it('re-renders when rows are added to the bound list', () => {
    const rowData = [makeRow(1)];
    createComponent(rowData);
    rowData.push(makeRow(2));
    fixture.detectChanges();
    expect(bodyRows().length).toBe(2);
  });

  it('copies the rendered table text into the table string', () => {
    createComponent([makeRow(1)]);
    component.updateTableString();
    expect(component.tableString).toContain('Saturated Liquid');
  });
});
