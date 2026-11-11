import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form.component';
import { PsatService } from '../../psat.service';
import { IntegrationStateService } from '../../../shared/connected-inventory/integration-state.service';
import { FieldDataService } from '../../field-data/field-data.service';
import { PumpFluidService } from '../../pump-fluid/pump-fluid.service';
import { MotorService } from '../../motor/motor.service';
import { PumpOperationsService } from '../../pump-operations/pump-operations.service';
import { PsatWarningService, FieldDataWarnings, MotorWarnings, OperationsWarnings } from '../../psat-warning.service';
import { PSAT, PsatInputs } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { ConnectedInventoryData } from '../../../shared/connected-inventory/integrations';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const MOCK_FIELD_DATA_WARNINGS: FieldDataWarnings = { flowError: '', voltageError: '', measuredPowerOrCurrentError: '', suggestedVoltage: '' };
const MOCK_MOTOR_WARNINGS: MotorWarnings = { rpmError: '', voltageError: '', flaError: '', ratedPowerError: '' };
const MOCK_OPERATIONS_WARNINGS: OperationsWarnings = { cost: '' };

function makePumpFluidForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    drive: new UntypedFormControl(1),
    specifiedDriveEfficiency: new UntypedFormControl(90),
  });
}

function makeFieldDataForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    implementationCosts: new UntypedFormControl(0),
    head: new UntypedFormControl(50),
  });
}

function makeMotorForm(): UntypedFormGroup {
  return new UntypedFormGroup({});
}

function makeOperationsForm(): UntypedFormGroup {
  return new UntypedFormGroup({});
}

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    operating_hours: 8760,
    fluidType: 'water',
    fluidTemperature: 60,
    head: 100,
    ...overrides,
  };
}

function makePsat(hasVfdOpportunity: boolean = false): PSAT {
  return {
    inputs: makePsatInputs(),
    modifications: [
      {
        id: 'mod-1',
        exploreOppsShowVfd: { hasOpportunity: hasVfdOpportunity, display: 'Install VFD' },
        psat: {
          inputs: makePsatInputs({ head: 120 }),
          name: 'Modification 1',
        },
      },
    ],
  };
}

describe('ExploreOpportunitiesFormComponent', () => {
  let component: ExploreOpportunitiesFormComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesFormComponent>;
  let motorServiceSpy: jasmine.SpyObj<MotorService>;
  let fieldDataServiceSpy: jasmine.SpyObj<FieldDataService>;
  let pumpFluidServiceSpy: jasmine.SpyObj<PumpFluidService>;
  let pumpOperationsServiceSpy: jasmine.SpyObj<PumpOperationsService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let modalOpenSpy: jasmine.SpyObj<{ next: (v: boolean) => void }>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let integrationStateServiceStub: { connectedInventoryData: BehaviorSubject<ConnectedInventoryData> };

  beforeEach(async () => {
    motorServiceSpy = jasmine.createSpyObj('MotorService', ['getFormFromObj', 'getInputsFromFrom']);
    motorServiceSpy.getFormFromObj.and.callFake(() => makeMotorForm());
    motorServiceSpy.getInputsFromFrom.and.callFake((_form: UntypedFormGroup, inputs: PsatInputs) => inputs);

    fieldDataServiceSpy = jasmine.createSpyObj('FieldDataService', ['getFormFromObj', 'getPsatInputsFromForm']);
    fieldDataServiceSpy.getFormFromObj.and.callFake(() => makeFieldDataForm());
    fieldDataServiceSpy.getPsatInputsFromForm.and.callFake((_form: UntypedFormGroup, inputs: PsatInputs) => inputs);

    pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', ['getFormFromObj', 'getPsatInputsFromForm']);
    pumpFluidServiceSpy.getFormFromObj.and.callFake(() => makePumpFluidForm());
    pumpFluidServiceSpy.getPsatInputsFromForm.and.callFake((_form: UntypedFormGroup, inputs: PsatInputs) => inputs);

    pumpOperationsServiceSpy = jasmine.createSpyObj('PumpOperationsService', ['getFormFromObj', 'getPsatInputsFromForm']);
    pumpOperationsServiceSpy.getFormFromObj.and.callFake(() => makeOperationsForm());
    pumpOperationsServiceSpy.getPsatInputsFromForm.and.callFake((_form: UntypedFormGroup, inputs: PsatInputs) => inputs);

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['checkFieldData', 'checkMotorWarnings', 'checkPumpOperations']);
    psatWarningServiceSpy.checkFieldData.and.returnValue(MOCK_FIELD_DATA_WARNINGS);
    psatWarningServiceSpy.checkMotorWarnings.and.returnValue(MOCK_MOTOR_WARNINGS);
    psatWarningServiceSpy.checkPumpOperations.and.returnValue(MOCK_OPERATIONS_WARNINGS);

    modalOpenSpy = jasmine.createSpyObj('BehaviorSubject', ['next']);
    psatServiceSpy = jasmine.createSpyObj('PsatService', [], { modalOpen: modalOpenSpy });

    integrationStateServiceStub = { connectedInventoryData: new BehaviorSubject<ConnectedInventoryData>({ connectedItem: undefined }) };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, ModalModule.forRoot()],
      declarations: [ExploreOpportunitiesFormComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: IntegrationStateService, useValue: integrationStateServiceStub },
        { provide: FieldDataService, useValue: fieldDataServiceSpy },
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: PumpOperationsService, useValue: pumpOperationsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesFormComponent);
    component = fixture.componentInstance;
    component.psat = makePsat(false);
    component.settings = MOCK_SETTINGS;
    component.exploreModIndex = 0;
    component.assessmentId = 1;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds baseline forms from the assessment psat inputs and disables them', () => {
      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalledWith(component.psat.inputs);
      expect(fieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(component.psat.inputs, true);
      expect(pumpFluidServiceSpy.getFormFromObj).toHaveBeenCalledWith(component.psat.inputs);
      expect(pumpOperationsServiceSpy.getFormFromObj).toHaveBeenCalledWith(component.psat.inputs);
      expect(component.baselineMotorForm.disabled).toBeTrue();
      expect(component.baselineFieldDataForm.disabled).toBeTrue();
      expect(component.baselinePumpFluidForm.disabled).toBeTrue();
      expect(component.baselineOperationsForm.disabled).toBeTrue();
    });

    it('builds modification forms from the current modification psat inputs, left enabled', () => {
      const modInputs = component.psat.modifications[0].psat.inputs;
      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalledWith(modInputs);
      expect(fieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(modInputs, false);
      expect(pumpFluidServiceSpy.getFormFromObj).toHaveBeenCalledWith(modInputs);
      expect(pumpOperationsServiceSpy.getFormFromObj).toHaveBeenCalledWith(modInputs);
      expect(component.modificationMotorForm.disabled).toBeFalse();
    });

    it('defaults exploreOppsShowVfd to no opportunity when the modification has none set and is not VFD', () => {
      expect(component.psat.modifications[0].exploreOppsShowVfd).toEqual({ hasOpportunity: false, display: 'Install VFD' });
    });

    it('marks the modification as having a VFD opportunity and clears isVFD when the modification input requests it', () => {
      const psatWithVfd = makePsat(false);
      delete psatWithVfd.modifications[0].exploreOppsShowVfd;
      psatWithVfd.modifications[0].psat.inputs.isVFD = true;
      component.psat = psatWithVfd;

      component.initForms();

      expect(component.psat.modifications[0].exploreOppsShowVfd).toEqual({ hasOpportunity: true, display: 'Install VFD' });
      expect(component.psat.modifications[0].psat.inputs.isVFD).toBeUndefined();
    });

    it('calls checkWarnings on init and assigns baseline/modification warnings', () => {
      expect(psatWarningServiceSpy.checkFieldData).toHaveBeenCalledWith(component.psat, component.settings);
      expect(psatWarningServiceSpy.checkFieldData).toHaveBeenCalledWith(component.psat.modifications[0].psat, component.settings);
      expect(psatWarningServiceSpy.checkMotorWarnings).toHaveBeenCalledWith(component.psat, component.settings, false);
      expect(psatWarningServiceSpy.checkMotorWarnings).toHaveBeenCalledWith(component.psat.modifications[0].psat, component.settings, true);
      expect(component.baselineFieldDataWarnings).toBe(MOCK_FIELD_DATA_WARNINGS);
      expect(component.modificationFieldDataWarnings).toBe(MOCK_FIELD_DATA_WARNINGS);
      expect(component.baselineMotorWarnings).toBe(MOCK_MOTOR_WARNINGS);
      expect(component.modificationOperationsaWarnings).toBe(MOCK_OPERATIONS_WARNINGS);
    });
  });

  describe('ngOnChanges', () => {
    it('does not rebuild forms when exploreModIndex changes for the first time', () => {
      motorServiceSpy.getFormFromObj.calls.reset();

      component.ngOnChanges({ exploreModIndex: new SimpleChange(undefined, 0, true) });

      expect(motorServiceSpy.getFormFromObj).not.toHaveBeenCalled();
    });

    it('rebuilds forms when exploreModIndex changes after the first change', () => {
      motorServiceSpy.getFormFromObj.calls.reset();

      component.ngOnChanges({ exploreModIndex: new SimpleChange(0, 0, false) });

      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalled();
    });
  });

  describe('calculate', () => {
    it('saves the modification inputs from all forms and emits emitCalculate', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      fieldDataServiceSpy.getPsatInputsFromForm.calls.reset();

      component.calculate();

      expect(fieldDataServiceSpy.getPsatInputsFromForm).toHaveBeenCalledWith(component.modificationFieldDataForm, component.psat.modifications[0].psat.inputs);
      expect(emitted).toEqual([true]);
    });

    it('emits changeField for fixedSpecificSpeed before saving when called with that field name', () => {
      const focused: string[] = [];
      component.changeField.subscribe(v => focused.push(v));

      component.calculate('fixedSpecificSpeed');

      expect(focused).toEqual(['fixedSpecificSpeed']);
    });
  });

  describe('save', () => {
    it('rebuilds modification psat inputs from all modification forms and re-checks warnings', () => {
      pumpFluidServiceSpy.getPsatInputsFromForm.calls.reset();
      motorServiceSpy.getInputsFromFrom.calls.reset();
      psatWarningServiceSpy.checkFieldData.calls.reset();

      component.save();

      expect(pumpFluidServiceSpy.getPsatInputsFromForm).toHaveBeenCalled();
      expect(motorServiceSpy.getInputsFromFrom).toHaveBeenCalled();
      expect(psatWarningServiceSpy.checkFieldData).toHaveBeenCalled();
    });

    it('emits emitSave', () => {
      const emitted: boolean[] = [];
      component.emitSave.subscribe(v => emitted.push(v));

      component.save();

      expect(emitted).toEqual([true]);
    });
  });

  describe('focusField', () => {
    it('emits changeField with the given field name', () => {
      const emitted: string[] = [];
      component.changeField.subscribe(v => emitted.push(v));

      component.focusField('flow_rate');

      expect(emitted).toEqual(['flow_rate']);
    });
  });

  describe('addNewMod', () => {
    it('emits emitAddNewMod', () => {
      const emitted: boolean[] = [];
      component.emitAddNewMod.subscribe(v => emitted.push(v));

      component.addNewMod();

      expect(emitted).toEqual([true]);
    });
  });

  describe('setVFD', () => {
    it('sets drive to VFD and specifiedDriveEfficiency to 95 when the modification has a VFD opportunity', () => {
      component.psat.modifications[0].exploreOppsShowVfd.hasOpportunity = true;

      component.setVFD();

      expect(component.modificationPumpFluidForm.controls.drive.value).toBe(4);
      expect(component.modificationPumpFluidForm.controls.specifiedDriveEfficiency.value).toBe(95);
    });

    it('resets drive to the baseline drive value when the modification has no VFD opportunity', () => {
      component.baselinePumpFluidForm.controls.drive.setValue(2);
      component.psat.modifications[0].exploreOppsShowVfd.hasOpportunity = false;

      component.setVFD();

      expect(component.modificationPumpFluidForm.controls.drive.value).toBe(2);
      expect(component.modificationPumpFluidForm.controls.specifiedDriveEfficiency.value).toBe(95);
    });

    it('triggers calculate (emits emitCalculate) after setting the drive', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.setVFD();

      expect(emitted).toEqual([true]);
    });
  });

  describe('showHeadToolModal / hideHeadToolModal', () => {
    let modalSpy: jasmine.SpyObj<{ show: () => void; hide: () => void }>;

    beforeEach(() => {
      modalSpy = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      component.headToolModal = modalSpy as any;
    });

    it('opens the shared modal-open signal, shows the modal, and sets showHeadTool', () => {
      component.showHeadToolModal();

      expect(modalOpenSpy.next).toHaveBeenCalledWith(true);
      expect(modalSpy.show).toHaveBeenCalled();
      expect(component.showHeadTool).toBeTrue();
    });

    it('applies the modification head value, saves, closes the modal-open signal, hides the modal, and clears showHeadTool', () => {
      component.psat.modifications[0].psat.inputs.head = 77;
      component.showHeadToolModal();
      modalOpenSpy.next.calls.reset();

      component.hideHeadToolModal();

      expect(component.modificationFieldDataForm.controls.head.value).toBe(77);
      expect(modalOpenSpy.next).toHaveBeenCalledWith(false);
      expect(modalSpy.hide).toHaveBeenCalled();
      expect(component.showHeadTool).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    it('names the modification "Opportunities Modification" and saves when it has no name', () => {
      component.psat.modifications[0].psat.name = '';
      spyOn(component, 'save');

      component.ngOnDestroy();

      expect(component.psat.modifications[0].psat.name).toBe('Opportunities Modification');
      expect(component.save).toHaveBeenCalled();
    });

    it('does not rename or save when the modification already has a name', () => {
      component.psat.modifications[0].psat.name = 'My Modification';
      spyOn(component, 'save');

      component.ngOnDestroy();

      expect(component.psat.modifications[0].psat.name).toBe('My Modification');
      expect(component.save).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('hides the connected-inventory baseline panel when there is no connected item', () => {
      expect(fixture.nativeElement.querySelector('app-inventory-integration')).toBeNull();
    });

    it('shows the connected-inventory baseline panel when a connected item exists', () => {
      // connectedInventoryData is captured via getValue() inside initForms(), not a
      // live subscription, so re-running initForms() is required to pick up a new value.
      integrationStateServiceStub.connectedInventoryData.next({ connectedItem: { inventoryType: 'motor' } as any });
      component.initForms();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-inventory-integration')).not.toBeNull();
    });

    it('hides the connected-assessment-status rows when the connected item is not a pump', () => {
      integrationStateServiceStub.connectedInventoryData.next({ connectedItem: { inventoryType: 'motor' } as any });
      component.initForms();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-connected-assessment-status')).toBeNull();
    });

    it('shows the connected-assessment-status rows when the connected item is a pump', () => {
      integrationStateServiceStub.connectedInventoryData.next({ connectedItem: { inventoryType: 'pump' } as any });
      component.initForms();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-connected-assessment-status')).not.toBeNull();
    });

    it('hides the VFD form when the modification has no VFD opportunity', () => {
      expect(fixture.nativeElement.querySelector('app-variable-frequency-drive-form')).toBeNull();
    });

    it('shows the VFD form when the modification has a VFD opportunity', () => {
      component.psat.modifications[0].exploreOppsShowVfd.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-variable-frequency-drive-form')).not.toBeNull();
    });

    it('hides the head tool body when showHeadTool is false', () => {
      expect(fixture.nativeElement.querySelector('app-head-tool')).toBeNull();
    });

    it('shows the head tool body when showHeadTool is true', () => {
      component.showHeadTool = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-head-tool')).not.toBeNull();
    });
  });
});
