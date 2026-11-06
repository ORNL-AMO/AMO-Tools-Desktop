import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { ChillerInventoryService } from './chiller-inventory.service';
import { SystemInformationFormService } from '../system-information/system-information-form.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { WEATHER_CONTEXT, WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { getDefaultProcessCoolingAssessment } from '../constants/process-cooling-constants';

describe('ProcessCoolingAssessmentService', () => {
  let service: ProcessCoolingAssessmentService;
  let assessmentSettings: Settings;

  beforeEach(() => {
    assessmentSettings = undefined;
    TestBed.configureTestingModule({
      providers: [
        ProcessCoolingAssessmentService,
        ConvertProcessCoolingService,
        { provide: ProcessCoolingSuiteApiService, useValue: {} },
        {
          provide: SettingsDbService, useValue: {
            getByAssessmentId: (_assessment: Assessment, isAssessmentSettings: boolean) => isAssessmentSettings
              ? assessmentSettings
              : { id: 2, directoryId: 1, unitsOfMeasure: 'Metric', fuelCost: 9.5 } as Settings,
            addWithObservable: (settings: Settings) => {
              assessmentSettings = { ...settings, id: 3 };
              return of(undefined);
            },
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
        { provide: ChillerInventoryService, useValue: {} },
        {
          provide: WEATHER_CONTEXT, useValue: {
            weatherContextData$: new BehaviorSubject<WeatherContextData>(undefined),
            isValidWeatherData: () => false,
          }
        },
      ]
    });
    service = TestBed.inject(ProcessCoolingAssessmentService);
  });

  describe('initAssessmentSettings', () => {
    it('converts a new Metric assessment without mutating the emitted object', async () => {
      const processCooling: ProcessCoolingAssessment = getDefaultProcessCoolingAssessment({ fuelCost: 10 } as Settings);
      processCooling.inventory[0].capacity = 100;
      processCooling.weatherData = {
        addressString: '',
        selectedStation: null,
        weatherDataPoints: [{ dry_bulb_temp: 212, wet_bulb_temp: 32 } as any],
      };
      const assessment = { id: 1, processCooling } as Assessment;
      service.setAssessment(assessment);
      service.setProcessCooling(processCooling);

      await service.initAssessmentSettings(assessment);

      const converted: ProcessCoolingAssessment = service.processCoolingSignal();
      expect(converted).not.toBe(processCooling);
      expect(converted.existingDataUnits).toBe('Metric');
      expect(converted.inventory[0].capacity).toBe(351.69);
      expect(converted.systemInformation.operations.fuelCost).toBe(9.5);
      expect(converted.weatherData.weatherDataPoints[0].dry_bulb_temp).toBeCloseTo(100, 8);

      expect(processCooling.inventory[0].capacity).toBe(100);
      expect(processCooling.existingDataUnits).not.toBe('Metric');
      expect(processCooling.weatherData.weatherDataPoints[0].dry_bulb_temp).toBe(212);
    });
  });
});
