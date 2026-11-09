import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PhastService } from '../../../phast/phast.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { EnergyEquivalencyComponent } from './energy-equivalency.component';
import { EnergyEquivalencyService } from './energy-equivalency.service';

describe('EnergyEquivalencyComponent', () => {
  let fixture: ComponentFixture<EnergyEquivalencyComponent>;
  let savedCalculators: Calculator[];

  beforeEach(() => {
    savedCalculators = [];
    TestBed.configureTestingModule({
      declarations: [EnergyEquivalencyComponent],
      providers: [
        EnergyEquivalencyService,
        ConvertUnitsService,
        { provide: PhastService, useValue: { energyEquivalencyFuel: () => ({}), energyEquivalencyElectric: () => ({}) } },
        { provide: SettingsDbService, useValue: { globalSettings: {} } },
        { provide: AnalyticsService, useValue: { sendEvent: () => {} } },
        {
          provide: CalculatorDbService,
          useValue: {
            getByAssessmentId: (): Calculator => undefined,
            saveAssessmentCalculator: (_assessment: Assessment, calculator: Calculator) => {
              savedCalculators.push(calculator);
              return Promise.resolve();
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(EnergyEquivalencyComponent);
    fixture.componentInstance.inAssessment = true;
    fixture.componentInstance.assessment = { id: 1 } as Assessment;
    fixture.componentInstance.settings = { unitsOfMeasure: 'Imperial', phastRollupFuelUnit: 'MMBtu', phastRollupElectricityUnit: 'kWh' } as Settings;
  });

  it('starts an assessment with no saved calculator on default inputs and forms', () => {
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.energyEquivalencyElectric.fuelFiredEfficiency).toBe(60);
    expect(component.energyEquivalencyFuel).toBeDefined();
    expect(component.formElectric).toBeDefined();
    expect(component.formFuel).toBeDefined();
    expect(savedCalculators[0].energyEquivalencyInputs.energyEquivalencyElectric).toBe(component.energyEquivalencyElectric);
  });

  it('saves edits made on a first visit', () => {
    fixture.detectChanges();
    const edited = { ...fixture.componentInstance.energyEquivalencyElectric, fuelFiredEfficiency: 75 };

    fixture.componentInstance.updateElectric(edited);

    expect(savedCalculators.at(-1).energyEquivalencyInputs.energyEquivalencyElectric).toBe(edited);
  });
});
