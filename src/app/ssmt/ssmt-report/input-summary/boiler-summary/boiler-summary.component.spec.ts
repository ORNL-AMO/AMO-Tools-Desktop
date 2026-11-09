import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { BoilerSummaryComponent } from './boiler-summary.component';

describe('BoilerSummaryComponent blowdown routing', () => {
  let fixture: ComponentFixture<BoilerSummaryComponent>;
  let component: BoilerSummaryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoilerSummaryComponent],
      imports: [SharedPipesModule],
      providers: [
        ConvertUnitsService,
        { provide: FlueGasMaterialDbService, useValue: { getAllMaterials: () => [{ id: 1, substance: 'Natural Gas' }] } },
        { provide: SolidLiquidMaterialDbService, useValue: { getAllMaterials: () => [] } },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BoilerSummaryComponent);
    component = fixture.componentInstance;
  });

  it('shows differing blowdown destinations in the input table', () => {
    const buildInputData = (sendBlowdownToDeaerator: boolean) => ({
      boilerInput: {
        fuelType: 1,
        fuel: 1,
        blowdownFlashed: true,
        sendBlowdownToDeaerator,
      }
    } as SSMTInputs);

    component.baselineInputData = buildInputData(false);
    component.modificationInputData = [{
      name: 'Route to Deaerator',
      inputData: buildInputData(true),
      valid: { boilerValid: true }
    } as any];
    component.settings = {
      steamTemperatureMeasurement: 'F',
      steamPressureMeasurement: 'psig'
    } as Settings;
    component.printView = true;

    fixture.detectChanges();

    const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'));
    const routingRow = rows.find(row => row.textContent.includes('Send Blowdown Flash Steam to Deaerator?'));

    expect(routingRow).toBeDefined();
    expect(routingRow?.textContent).toContain('No');
    expect(routingRow?.textContent).toContain('Yes');
    expect(component.sendBlowdownToDeaeratorDiff[0]).toBeTrue();
  });
});
