import { Component, EventEmitter, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PhastService } from '../../../phast/phast.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { FlowCalculations } from '../../../shared/models/phast/flowCalculations';
import { Settings } from '../../../shared/models/settings';
import { EnergyUseComponent } from './energy-use.component';
import { EnergyUseService } from './energy-use.service';

@Component({ selector: 'app-energy-use-form', template: '', standalone: false })
class EnergyUseFormStubComponent {
  @Output() emitCalculate = new EventEmitter<FlowCalculations>();
}

describe('EnergyUseComponent', () => {
  let fixture: ComponentFixture<EnergyUseComponent>;
  let savedCalculator: Calculator;
  let calculatedWith: FlowCalculations[];

  beforeEach(() => {
    savedCalculator = { id: 1, assessmentId: 1, flowCalculations: { gasType: 0 } as FlowCalculations };
    calculatedWith = [];
    TestBed.configureTestingModule({
      declarations: [EnergyUseComponent, EnergyUseFormStubComponent],
      providers: [
        EnergyUseService,
        ConvertUnitsService,
        {
          provide: PhastService,
          useValue: { flowCalculations: (inputs: FlowCalculations) => { calculatedWith.push(inputs); return {}; } },
        },
        { provide: SettingsDbService, useValue: { globalSettings: {} } },
        { provide: AnalyticsService, useValue: { sendEvent: () => {} } },
        {
          provide: CalculatorDbService,
          useValue: { getByAssessmentId: () => savedCalculator, saveAssessmentCalculator: () => Promise.resolve() },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(EnergyUseComponent);
    fixture.componentInstance.inAssessment = true;
    fixture.componentInstance.assessment = { id: 1 } as Assessment;
    fixture.componentInstance.settings = { unitsOfMeasure: 'Imperial' } as Settings;
    fixture.detectChanges();
  });

  it('calculates and saves the inputs the form emits in an assessment', async () => {
    const edited = { gasType: 1 } as FlowCalculations;

    fixture.debugElement.query(By.directive(EnergyUseFormStubComponent)).componentInstance.emitCalculate.emit(edited);

    await fixture.whenStable();

    expect(savedCalculator.flowCalculations).toBe(edited);
    expect(calculatedWith.at(-1)).toBe(edited);
  });
});
