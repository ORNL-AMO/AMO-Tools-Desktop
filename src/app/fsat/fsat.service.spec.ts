import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { FsatService } from './fsat.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SettingsService } from '../settings/settings.service';
import { ConvertFsatService } from './convert-fsat.service';
import { FansSuiteApiService } from '../tools-suite-api/fans-suite-api.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { ConvertFanAnalysisService } from '../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { OperationsService } from './operations/operations.service';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';

describe('FsatService.initAssessmentSettings', () => {
  let service: FsatService;
  let settingsDbService: jasmine.SpyObj<SettingsDbService>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  const assessment: Assessment = { id: 12, type: 'FSAT' } as Assessment;
  const existingSettings: Settings = { id: 1, assessmentId: 12, unitsOfMeasure: 'Imperial' } as Settings;

  beforeEach(() => {
    settingsDbService = jasmine.createSpyObj('SettingsDbService', ['getByAssessmentId', 'addWithObservable', 'getAllSettings', 'setAll']);
    settingsService = jasmine.createSpyObj('SettingsService', ['getNewSettingFromSetting']);

    TestBed.configureTestingModule({
      providers: [
        FsatService,
        { provide: Router, useValue: {} },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: SettingsService, useValue: settingsService },
        { provide: ConvertFsatService, useValue: {} },
        { provide: FansSuiteApiService, useValue: {} },
        { provide: AssessmentCo2SavingsService, useValue: {} },
        { provide: ConvertUnitsService, useValue: {} },
        { provide: FanFieldDataService, useValue: {} },
        { provide: ConvertFanAnalysisService, useValue: {} },
        { provide: FsatFluidService, useValue: {} },
        { provide: FanSetupService, useValue: {} },
        { provide: FanMotorService, useValue: {} },
        { provide: OperationsService, useValue: {} },
      ]
    });
    service = TestBed.inject(FsatService);
  });

  it('returns existing settings without creating new ones', async () => {
    settingsDbService.getByAssessmentId.and.returnValue(existingSettings);

    const result = await service.initAssessmentSettings(assessment);

    expect(result).toBe(existingSettings);
    expect(settingsDbService.addWithObservable).not.toHaveBeenCalled();
  });

  it('creates default settings when none exist for the assessment', async () => {
    const defaultSettings: Settings = { unitsOfMeasure: 'Custom' } as Settings;
    const newSettings: Settings = { unitsOfMeasure: 'Custom' } as Settings;
    const createdSettings: Settings = { id: 2, assessmentId: 12, unitsOfMeasure: 'Custom' } as Settings;

    settingsDbService.getByAssessmentId.and.returnValues(undefined, defaultSettings, createdSettings);
    settingsService.getNewSettingFromSetting.and.returnValue(newSettings);
    settingsDbService.addWithObservable.and.returnValue(of(newSettings));
    settingsDbService.getAllSettings.and.returnValue(of([createdSettings]));

    const result = await service.initAssessmentSettings(assessment);

    expect(settingsService.getNewSettingFromSetting).toHaveBeenCalledWith(defaultSettings);
    expect(settingsDbService.addWithObservable).toHaveBeenCalled();
    expect(settingsDbService.setAll).toHaveBeenCalledWith([createdSettings]);
    expect(result).toBe(createdSettings);
  });
});

describe('FsatService main tab stepping', () => {
  let service: FsatService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        FsatService,
        { provide: Router, useValue: routerSpy },
        { provide: SettingsDbService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: ConvertFsatService, useValue: {} },
        { provide: FansSuiteApiService, useValue: {} },
        { provide: AssessmentCo2SavingsService, useValue: {} },
        { provide: ConvertUnitsService, useValue: {} },
        { provide: FanFieldDataService, useValue: {} },
        { provide: ConvertFanAnalysisService, useValue: {} },
        { provide: FsatFluidService, useValue: {} },
        { provide: FanSetupService, useValue: {} },
        { provide: FanMotorService, useValue: {} },
        { provide: OperationsService, useValue: {} },
      ]
    });
    service = TestBed.inject(FsatService);
    service.assessment.next({ id: 7 } as Assessment);
  });

  it('continueMainTab navigates to the next main tab', () => {
    service.mainTab.next('report');
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/fsat', 7, 'sankey']);
  });

  it('continueMainTab does nothing on the last main tab', () => {
    service.mainTab.next('calculators');
    service.continueMainTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('backMainTab navigates to the previous main tab', () => {
    service.mainTab.next('calculators');
    service.backMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/fsat', 7, 'sankey']);
  });

  it('backMainTab does nothing on the first main tab', () => {
    service.mainTab.next('baseline');
    service.backMainTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  describe('baseline step tabs', () => {
    it('continue advances to the next step tab', () => {
      service.stepTab.next('fan-operations');
      service.continue();
      expect(service.stepTab.value).toBe('fan-setup');
    });

    it('continue from the last step tab opens the assessment tab', () => {
      service.stepTab.next('fan-field-data');
      service.continue();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/fsat', 7, 'assessment']);
    });

    it('back returns to the previous step tab on baseline', () => {
      service.mainTab.next('baseline');
      service.stepTab.next('fan-motor');
      service.back();
      expect(service.stepTab.value).toBe('fan-setup');
    });
  });
});
