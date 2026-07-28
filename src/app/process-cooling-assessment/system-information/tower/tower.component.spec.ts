import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TowerComponent } from './tower.component';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { SystemInformationFormService, TowerForm } from '../system-information-form.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { TowerInput, TowerType, TowerSizeMetric } from '../../../shared/models/process-cooling-assessment';
import { Settings } from '../../../shared/models/settings';
import { getDefaultProcessCoolingAssessment } from '../../constants/process-cooling-constants';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', powerMeasurement: 'kW' } as Settings;

const MOCK_TOWER_INPUT: TowerInput = {
  ...getDefaultProcessCoolingAssessment(MOCK_SETTINGS).systemInformation.towerInput,
  usesFreeCooling: false, // start collapsed so the hidden-state template tests exercise the initial branch
};

function makeTowerForm(): FormGroup<TowerForm> {
  return new FormGroup<TowerForm>({
    usesFreeCooling: new FormControl<boolean>(MOCK_TOWER_INPUT.usesFreeCooling, { nonNullable: true }),
    isHEXRequired: new FormControl<boolean>(MOCK_TOWER_INPUT.isHEXRequired, { nonNullable: true }),
    HEXApproachTemp: new FormControl<number>(MOCK_TOWER_INPUT.HEXApproachTemp, { nonNullable: true }),
    numberOfTowers: new FormControl<number>(MOCK_TOWER_INPUT.numberOfTowers, { nonNullable: true }),
    towerType: new FormControl<number | null>(MOCK_TOWER_INPUT.towerType),
    numberOfFans: new FormControl<number>(MOCK_TOWER_INPUT.numberOfFans, { nonNullable: true }),
    fanSpeedType: new FormControl<number>(MOCK_TOWER_INPUT.fanSpeedType, { nonNullable: true }),
    towerSizeMetric: new FormControl<number>(MOCK_TOWER_INPUT.towerSizeMetric, { nonNullable: true }),
    fanType: new FormControl<number>(MOCK_TOWER_INPUT.fanType, { nonNullable: true }),
    towerSize: new FormControl<number>(MOCK_TOWER_INPUT.towerSize, { nonNullable: true }),
  });
}

describe('TowerComponent', () => {
  let component: TowerComponent;
  let fixture: ComponentFixture<TowerComponent>;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessCoolingAssessmentService>;
  let formServiceSpy: jasmine.SpyObj<SystemInformationFormService>;
  let mockForm: FormGroup<TowerForm>;

  const mockAssessment = {
    systemInformation: { towerInput: MOCK_TOWER_INPUT },
  } as any;

  beforeEach(async () => {
    mockForm = makeTowerForm();

    assessmentServiceSpy = jasmine.createSpyObj(
      'ProcessCoolingAssessmentService',
      ['updateSystemInformationProperty'],
      {
        processCoolingSignal: signal(mockAssessment),
        settingsSignal: signal(MOCK_SETTINGS),
      }
    );

    formServiceSpy = jasmine.createSpyObj('SystemInformationFormService', [
      'getTowerForm',
      'getTowerTypeDependentValues',
      'getTowerSizeValidators',
      'getHexApproachTempValidators',
      'getTowerInput',
    ]);
    formServiceSpy.getTowerForm.and.returnValue(mockForm);
    formServiceSpy.getTowerTypeDependentValues.and.returnValue({ numberOfFans: 2, fanSpeedType: 1 });
    formServiceSpy.getTowerSizeValidators.and.returnValue([]);
    formServiceSpy.getHexApproachTempValidators.and.returnValue([Validators.required]);
    formServiceSpy.getTowerInput.and.returnValue({ ...MOCK_TOWER_INPUT });

    const uiServiceSpy = jasmine.createSpyObj(
      'ProcessCoolingUiService',
      [],
      { focusedFieldSignal: signal('') }
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TowerComponent],
      providers: [
        { provide: ProcessCoolingAssessmentService, useValue: assessmentServiceSpy },
        { provide: SystemInformationFormService, useValue: formServiceSpy },
        { provide: ProcessCoolingUiService, useValue: uiServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('calls getTowerForm with towerInput from the assessment signal and current settings', () => {
      expect(formServiceSpy.getTowerForm).toHaveBeenCalledWith(MOCK_TOWER_INPUT, MOCK_SETTINGS);
    });

    it('assigns the form returned by the form service', () => {
      expect(component.form).toBe(mockForm);
    });

    it('generates controlIds from the form controls', () => {
      expect(component.controlIds).toBeDefined();
    });
  });

  describe('observeTowerTypeChange', () => {
    it('sets numberOfFans and fanSpeedType from dependent values when towerType changes', () => {
      component.towerType.setValue(1);
      expect(component.numberOfFans.value).toBe(2);
      expect(component.fanSpeedType.value).toBe(1);
    });
  });

  describe('observeIsHEXRequiredChange', () => {
    it('applies required validator to HEXApproachTemp when isHEXRequired becomes true', () => {
      component.isHEXRequired.setValue(true);
      expect(component.HEXApproachTemp.hasValidator(Validators.required)).toBeTrue();
    });

    it('clears validators from HEXApproachTemp when isHEXRequired becomes false', () => {
      component.isHEXRequired.setValue(true);
      component.isHEXRequired.setValue(false);
      expect(component.HEXApproachTemp.validator).toBeNull();
    });
  });

  describe('observeTowerSizeChange', () => {
    it('requests updated validators from form service when towerSizeMetric changes', () => {
      component.towerSizeMetric.setValue(1);
      expect(formServiceSpy.getTowerSizeValidators).toHaveBeenCalledWith(1);
    });
  });

  describe('template visibility', () => {
    it('hides numberOfFans when towerType is not VariableSpeed', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="numberOfFans"]')).toBeNull();
    });

    it('shows numberOfFans when towerType is VariableSpeed', () => {
      component.towerType.setValue(TowerType.VariableSpeed);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="numberOfFans"]')).not.toBeNull();
    });

    it('shows towerSize and fanType when towerSizeMetric is not Unknown', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="towerSize"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="fanType"]')).not.toBeNull();
    });

    it('hides towerSize and fanType when towerSizeMetric is Unknown', () => {
      component.towerSizeMetric.setValue(TowerSizeMetric.Unknown);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="towerSize"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="fanType"]')).toBeNull();
    });

    it('hides isHEXRequired when usesFreeCooling is false', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="isHEXRequired"]')).toBeNull();
    });

    it('shows isHEXRequired when usesFreeCooling is true', () => {
      component.usesFreeCooling.setValue(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="isHEXRequired"]')).not.toBeNull();
    });

    it('hides HEXApproachTemp when usesFreeCooling is true but isHEXRequired is false', () => {
      component.usesFreeCooling.setValue(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="HEXApproachTemp"]')).toBeNull();
    });

    it('shows HEXApproachTemp when both usesFreeCooling and isHEXRequired are true', () => {
      component.usesFreeCooling.setValue(true);
      component.isHEXRequired.setValue(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="HEXApproachTemp"]')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops calling updateSystemInformationProperty after component is destroyed', () => {
      assessmentServiceSpy.updateSystemInformationProperty.calls.reset();
      fixture.destroy();
      component.numberOfTowers.setValue(5);
      expect(assessmentServiceSpy.updateSystemInformationProperty).not.toHaveBeenCalled();
    });

    it('stops updating dependent tower values after component is destroyed', () => {
      fixture.destroy();
      const fansBefore = component.numberOfFans.value;
      component.towerType.setValue(2);
      expect(component.numberOfFans.value).toBe(fansBefore);
    });
  });
});
