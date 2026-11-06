import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { SystemBasicsComponent } from './system-basics.component';
import { ProcessCoolingAssessmentComponent } from '../process-cooling-assessment/process-cooling-assessment.component';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ConvertProcessCoolingService } from '../services/convert-process-cooling.service';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { ChillerInventoryService } from '../services/chiller-inventory.service';
import { SystemInformationFormService } from '../system-information/system-information-form.service';
import { WEATHER_CONTEXT, WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { Settings } from '../../shared/models/settings';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { getDefaultProcessCoolingAssessment } from '../constants/process-cooling-constants';

describe('SystemBasicsComponent units change', () => {
  let component: SystemBasicsComponent;
  let assessmentService: ProcessCoolingAssessmentService;
  let showUpdateUnitsModal: ReturnType<typeof signal<boolean>>;
  let selectedChiller: ChillerInventoryItem;
  let weatherData: WeatherContextData;
  let convertService: ConvertProcessCoolingService;

  beforeEach(() => {
    const processCooling: ProcessCoolingAssessment = getDefaultProcessCoolingAssessment({ fuelCost: 10 } as Settings);
    processCooling.existingDataUnits = 'Imperial';
    processCooling.inventory[0].capacity = 100;
    weatherData = {
      addressString: '',
      selectedStation: { name: 'station' } as any,
      weatherDataPoints: [{ dry_bulb_temp: 77, wet_bulb_temp: 59 } as any],
    };
    processCooling.weatherData = weatherData;
    selectedChiller = processCooling.inventory[0];
    showUpdateUnitsModal = signal(false);

    TestBed.configureTestingModule({
      providers: [
        ProcessCoolingAssessmentService,
        ConvertProcessCoolingService,
        { provide: ProcessCoolingSuiteApiService, useValue: {} },
        {
          provide: SettingsService, useValue: {
            getFormFromSettings: (settings: Settings) => new UntypedFormGroup({ unitsOfMeasure: new UntypedFormControl(settings.unitsOfMeasure) }),
            getSettingsFromForm: (form: UntypedFormGroup) => ({ ...form.value } as Settings),
          }
        },
        {
          provide: SettingsDbService, useValue: {
            updateWithObservable: () => of(undefined),
            getAllSettings: () => of([]),
            setAll: () => { },
          }
        },
        {
          provide: AssessmentDbService, useValue: {
            updateWithObservable: () => of(undefined),
            getAllAssessments: () => of([]),
            setAll: () => { },
          }
        },
        { provide: SystemInformationFormService, useValue: {} },
        { provide: AnalyticsService, useValue: { sendEvent: () => { } } },
        {
          provide: ProcessCoolingUiService, useValue: {
            showUpdateUnitsModalSignal: showUpdateUnitsModal,
            canContinue: signal(true),
            canGoBack: signal(true),
          }
        },
        {
          provide: ChillerInventoryService, useValue: {
            get selectedChillerValue() { return selectedChiller; },
            setSelectedChiller: (chiller: ChillerInventoryItem) => selectedChiller = chiller,
          }
        },
        {
          provide: WEATHER_CONTEXT, useValue: {
            settings: undefined,
            weatherContextData$: new BehaviorSubject<WeatherContextData>(undefined),
            isValidWeatherData: () => false,
            getWeatherData: () => weatherData,
            setWeatherData: (value: WeatherContextData) => weatherData = value,
          }
        },
      ]
    });
    convertService = TestBed.inject(ConvertProcessCoolingService);
    assessmentService = TestBed.inject(ProcessCoolingAssessmentService);
    assessmentService.setSettings({ id: 1, assessmentId: 1, unitsOfMeasure: 'Imperial' } as Settings);
    assessmentService.setProcessCooling(processCooling);
    component = TestBed.runInInjectionContext(() => new SystemBasicsComponent());
    component.ngOnInit();
  });

  async function changeUnits(unitsOfMeasure: string) {
    component.settingsForm.patchValue({ unitsOfMeasure });
    await component.saveSettings();
  }

  /** Answers the update units modal from the parent component, as the template does */
  function answerUpdateUnitsModal(shouldUpdateData: boolean) {
    const parent = TestBed.runInInjectionContext(() => new ProcessCoolingAssessmentComponent());
    parent.selectUpdateAction(shouldUpdateData);
  }

  function getSuiteDryBulbTemp(): number {
    return convertService.convertWeatherDataForSuiteApi(weatherData, assessmentService.settingsSignal()).weatherDataPoints[0].dry_bulb_temp;
  }

  it('keeps the weather sent to the Suite unchanged when the user continues without updating', async () => {
    await changeUnits('Metric');
    expect(showUpdateUnitsModal()).toBe(true);
    answerUpdateUnitsModal(false);

    expect(getSuiteDryBulbTemp()).toBeCloseTo(77, 8);
    expect(assessmentService.processCoolingSignal().weatherData.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(25, 8);
    expect(assessmentService.processCoolingSignal().existingDataUnits).toBe('Imperial');
    expect(component.showUpdateDataReminder()).toBe(true);
  });

  it('keeps the weather sent to the Suite unchanged when the user updates data', async () => {
    await changeUnits('Metric');
    answerUpdateUnitsModal(true);

    expect(getSuiteDryBulbTemp()).toBeCloseTo(77, 8);
    expect(assessmentService.processCoolingSignal().existingDataUnits).toBe('Metric');
    expect(component.showUpdateDataReminder()).toBe(false);
  });

  it('updates data from the modal after System Basics is destroyed', async () => {
    await changeUnits('Metric');
    component = undefined;
    answerUpdateUnitsModal(true);

    const processCooling: ProcessCoolingAssessment = assessmentService.processCoolingSignal();
    expect(processCooling.existingDataUnits).toBe('Metric');
    expect(processCooling.inventory[0].capacity).toBe(351.69);
    expect(selectedChiller.capacity).toBe(351.69);
    expect(processCooling.weatherData).toBe(weatherData);
  });

  it('does not convert the weather again when the user updates data later from the reminder', async () => {
    await changeUnits('Metric');
    answerUpdateUnitsModal(false);
    component.updateData();

    expect(getSuiteDryBulbTemp()).toBeCloseTo(77, 8);
    expect(assessmentService.processCoolingSignal().inventory[0].capacity).toBe(351.69);
    expect(component.showUpdateDataReminder()).toBe(false);
  });

  it('does not convert data twice', async () => {
    await changeUnits('Metric');
    answerUpdateUnitsModal(true);
    component.updateData();

    expect(assessmentService.processCoolingSignal().inventory[0].capacity).toBe(351.69);
  });

  it('converts the weather back and clears the reminder when units are changed back', async () => {
    await changeUnits('Metric');
    answerUpdateUnitsModal(false);
    showUpdateUnitsModal.set(false);
    await changeUnits('Imperial');

    expect(showUpdateUnitsModal()).toBe(false);
    expect(weatherData.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(77, 8);
    expect(getSuiteDryBulbTemp()).toBeCloseTo(77, 8);
    expect(component.showUpdateDataReminder()).toBe(false);
    expect(assessmentService.processCoolingSignal().inventory[0].capacity).toBe(100);
  });
});
