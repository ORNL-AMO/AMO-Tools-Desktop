import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasMoistureModalService } from '../../../../shared/flue-gas-moisture-modal/flue-gas-moisture-modal.service';
import { Settings } from '../../../../shared/models/settings';
import { FanImperialDefaults, FanMetricDefaults } from '../../../../settings/settings.service';
import { FlueGasMoistureDialogComponent } from './flue-gas-moisture-dialog.component';

const IMPERIAL = { unitsOfMeasure: 'Imperial', ...FanImperialDefaults } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', ...FanMetricDefaults } as Settings;

describe('FlueGasMoistureDialogComponent', () => {
  let fixture: ComponentFixture<FlueGasMoistureDialogComponent>;
  let component: FlueGasMoistureDialogComponent;

  function render(settings: Settings): FlueGasMoistureModalService {
    TestBed.configureTestingModule({
      declarations: [FlueGasMoistureDialogComponent],
      providers: [
        ConvertUnitsService,
        { provide: DialogRef, useValue: jasmine.createSpyObj('DialogRef', ['close']) },
        { provide: DIALOG_DATA, useValue: { settings } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(FlueGasMoistureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture.debugElement.injector.get(FlueGasMoistureModalService);
  }

  it('leaves the Imperial defaults unchanged', () => {
    const service = render(IMPERIAL);

    expect(service.baseGasDensity.dryBulbTemp).toBe(68);
    expect(service.baseGasDensity.barometricPressure).toBe(29.92);
  });

  it('converts the defaults to Metric fan units', () => {
    const service = render(METRIC);

    expect(service.baseGasDensity.dryBulbTemp).toBeCloseTo(20, 1);
    expect(service.baseGasDensity.barometricPressure).toBeCloseTo(101325, -2);
  });

  it('does not mutate the settings passed in', () => {
    const settings = { ...METRIC, fanBarometricPressure: 'inHg' } as Settings;

    render(settings);

    expect(settings.fanBarometricPressure).toBe('inHg');
  });
});
