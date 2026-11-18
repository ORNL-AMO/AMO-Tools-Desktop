import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { WaterPumpComponent } from './water-pump.component';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { SystemInformationFormService } from '../../system-information-form.service';
import { getDefaultProcessCoolingAssessment } from '../../../constants/process-cooling-constants';
import { Settings } from '../../../../shared/models/settings';
import { CoolingWaterPumpType, ProcessCoolingAssessment, PumpInput } from '../../../../shared/models/process-cooling-assessment';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', powerMeasurement: 'kW' } as Settings;

describe('WaterPumpComponent', () => {
  let component: WaterPumpComponent;
  let fixture: ComponentFixture<WaterPumpComponent>;
  let pumpFormService: SystemInformationFormService;
  let assessmentSignal: WritableSignal<ProcessCoolingAssessment>;
  let processCoolingService;

  beforeEach(async () => {
    const assessment = getDefaultProcessCoolingAssessment(MOCK_SETTINGS);
    assessmentSignal = signal(assessment);
    processCoolingService = {
      processCoolingSignal: assessmentSignal,
      settingsSignal: signal(MOCK_SETTINGS),
      updateSystemInformationProperty: jasmine.createSpy('updateSystemInformationProperty')
        .and.callFake((property: CoolingWaterPumpType, value: PumpInput) => {
          assessmentSignal.update((current) => ({
            ...current,
            systemInformation: { ...current.systemInformation, [property]: value },
          }));
        }),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WaterPumpComponent],
      providers: [
        { provide: ProcessCoolingAssessmentService, useValue: processCoolingService },
        { provide: ProcessCoolingUiService, useValue: { focusedFieldSignal: signal('') } },
        SystemInformationFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    pumpFormService = TestBed.inject(SystemInformationFormService);
    spyOn(pumpFormService, 'getPumpInputForm').and.callThrough();

    fixture = TestBed.createComponent(WaterPumpComponent);
    fixture.componentRef.setInput('pumpFormType', 'chilledWaterPumpInput');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not recreate the form when a pump value updates the assessment', () => {
    const form = component.form;

    component.flowRate.setValue(2.5);
    fixture.detectChanges();

    expect(processCoolingService.updateSystemInformationProperty).toHaveBeenCalled();
    expect(component.form).toBe(form);
    expect(pumpFormService.getPumpInputForm).toHaveBeenCalledTimes(1);
  });
});
