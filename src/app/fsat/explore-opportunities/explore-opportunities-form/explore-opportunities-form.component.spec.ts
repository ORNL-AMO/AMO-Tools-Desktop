import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form.component';
import { HelpPanelService } from '../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../modify-conditions/modify-conditions.service';
import { FanFieldDataService } from '../../fan-field-data/fan-field-data.service';
import { FanMotorService } from '../../fan-motor/fan-motor.service';
import { FanSetupService } from '../../fan-setup/fan-setup.service';
import { OperationsService } from '../../operations/operations.service';
import { FsatService } from '../../fsat.service';
import { FsatWarningService, FanFieldDataWarnings, FanOperationsWarnings } from '../../fsat-warning.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FSAT, FieldData, FanMotor, FanSetup, FsatOperations, FsatOutput, InletPressureData, OutletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const BASELINE_RESULTS = { fanEfficiency: 65.1234, fanShaftPower: 120 } as FsatOutput;
const MOCK_FIELD_DATA_WARNINGS: FanFieldDataWarnings = {
  voltageError: null, ratedPowerError: null, suggestedVoltage: null, inletPressureError: null, outletPressureError: null, calcInletVelocityPressureError: null
};
const MOCK_OPERATIONS_WARNINGS: FanOperationsWarnings = { costError: null };

function makeInletPressureData(calculatedInletPressure: number): InletPressureData {
  return { calculatedInletPressure } as InletPressureData;
}

function makeOutletPressureData(calculatedOutletPressure: number): OutletPressureData {
  return { calculatedOutletPressure } as OutletPressureData;
}

function makeFieldData(): FieldData {
  return {
    flowRate: 1000,
    inletPressure: -1,
    outletPressure: 5,
    userDefinedCompressibilityFactor: false,
    inletPressureData: makeInletPressureData(-1),
    outletPressureData: makeOutletPressureData(5),
  } as FieldData;
}

function makeFsat(options: { hasVfdOpportunity?: boolean, name?: string } = {}): FSAT {
  const { hasVfdOpportunity = false, name = 'Modification 1' } = options;
  return {
    fieldData: makeFieldData(),
    fsatOperations: { cost: 0.06 } as FsatOperations,
    fanMotor: { efficiencyClass: 0 } as FanMotor,
    fanSetup: { drive: 1 } as FanSetup,
    modifications: [{
      id: 'mod-1',
      exploreOppsShowVfd: { hasOpportunity: hasVfdOpportunity, display: 'Install VFD' },
      fsat: {
        name,
        whatIfScenario: true,
        implementationCosts: 500,
        fieldData: makeFieldData(),
        fsatOperations: { cost: 0.05 } as FsatOperations,
        fanMotor: { efficiencyClass: 1 } as FanMotor,
        fanSetup: { drive: 2 } as FanSetup,
        baseGasDensity: { gasDensity: 0.07, barometricPressure: 29.92, specificHeatRatio: 1.4 },
      },
    }],
  } as FSAT;
}

function makeFieldDataForm(): UntypedFormGroup {
  return new UntypedFormGroup({
    usingStaticPressure: new UntypedFormControl(true),
    ductArea: new UntypedFormControl(10),
    flowRate: new UntypedFormControl(1000),
    inletPressure: new UntypedFormControl(-1),
    outletPressure: new UntypedFormControl(5),
  });
}

function makeFanSetupForm(drive: number): UntypedFormGroup {
  return new UntypedFormGroup({
    drive: new UntypedFormControl(drive),
    specifiedDriveEfficiency: new UntypedFormControl(80),
  });
}

describe('ExploreOpportunitiesFormComponent', () => {
  let component: ExploreOpportunitiesFormComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesFormComponent>;
  let fsat: FSAT;
  let fanFieldDataServiceSpy: jasmine.SpyObj<FanFieldDataService>;
  let fanMotorServiceSpy: jasmine.SpyObj<FanMotorService>;
  let fanSetupServiceSpy: jasmine.SpyObj<FanSetupService>;
  let operationsServiceSpy: jasmine.SpyObj<OperationsService>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let fsatWarningServiceSpy: jasmine.SpyObj<FsatWarningService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let modalOpen: BehaviorSubject<boolean>;

  function createComponent(fsatInput: FSAT = makeFsat()): void {
    fsat = fsatInput;
    fixture = TestBed.createComponent(ExploreOpportunitiesFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('fsat', fsat);
    fixture.componentRef.setInput('exploreModIndex', 0);
    fixture.detectChanges();
    spyOn(component.pressureModal, 'show');
    spyOn(component.pressureModal, 'hide');
  }

  beforeEach(async () => {
    fanFieldDataServiceSpy = jasmine.createSpyObj('FanFieldDataService', ['getFormFromObj', 'getObjFromForm', 'calculateCompressibilityFactor']);
    fanFieldDataServiceSpy.getFormFromObj.and.callFake(() => makeFieldDataForm());
    fanFieldDataServiceSpy.getObjFromForm.and.callFake(() => makeFieldData());
    fanFieldDataServiceSpy.calculateCompressibilityFactor.and.returnValue(0.987);

    fanMotorServiceSpy = jasmine.createSpyObj('FanMotorService', ['getFormFromObj', 'getObjFromForm']);
    fanMotorServiceSpy.getFormFromObj.and.callFake(() => new UntypedFormGroup({}));
    fanMotorServiceSpy.getObjFromForm.and.returnValue({ efficiencyClass: 2 } as FanMotor);

    fanSetupServiceSpy = jasmine.createSpyObj('FanSetupService', ['getFormFromObj', 'getObjFromForm']);
    fanSetupServiceSpy.getFormFromObj.and.callFake((obj: FanSetup) => makeFanSetupForm(obj.drive));
    fanSetupServiceSpy.getObjFromForm.and.returnValue({ drive: 3 } as FanSetup);

    operationsServiceSpy = jasmine.createSpyObj('OperationsService', ['getFormFromObj', 'getObjFromForm']);
    operationsServiceSpy.getFormFromObj.and.callFake(() => new UntypedFormGroup({}));
    operationsServiceSpy.getObjFromForm.and.returnValue({ cost: 0.04 } as FsatOperations);

    modalOpen = new BehaviorSubject<boolean>(false);
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getResults'], { modalOpen });
    fsatServiceSpy.getResults.and.returnValue(BASELINE_RESULTS);

    fsatWarningServiceSpy = jasmine.createSpyObj('FsatWarningService', ['checkFieldDataWarnings', 'checkOperationsWarnings']);
    fsatWarningServiceSpy.checkFieldDataWarnings.and.returnValue(MOCK_FIELD_DATA_WARNINGS);
    fsatWarningServiceSpy.checkOperationsWarnings.and.returnValue(MOCK_OPERATIONS_WARNINGS);

    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['roundVal']);
    convertUnitsServiceSpy.roundVal.and.callFake((value: number, decimals: number) => Number(value.toFixed(decimals)));

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalModule.forRoot()],
      declarations: [ExploreOpportunitiesFormComponent],
      providers: [
        HelpPanelService,
        ModifyConditionsService,
        { provide: FanFieldDataService, useValue: fanFieldDataServiceSpy },
        { provide: FanMotorService, useValue: fanMotorServiceSpy },
        { provide: FanSetupService, useValue: fanSetupServiceSpy },
        { provide: OperationsService, useValue: operationsServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: FsatWarningService, useValue: fsatWarningServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(() => createComponent());

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds baseline forms from the assessment fsat and disables them', () => {
      expect(fanFieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(fsat.fieldData);
      expect(operationsServiceSpy.getFormFromObj).toHaveBeenCalledWith(fsat.fsatOperations);
      expect(fanMotorServiceSpy.getFormFromObj).toHaveBeenCalledWith(fsat.fanMotor);
      expect(fanSetupServiceSpy.getFormFromObj).toHaveBeenCalledWith(fsat.fanSetup, false);
      expect(component.baselineFieldDataForm.disabled).toBeTrue();
      expect(component.baselineOperationsForm.disabled).toBeTrue();
      expect(component.baselineMotorForm.disabled).toBeTrue();
      expect(component.baselineFanSetupForm.disabled).toBeTrue();
    });

    it('builds modification forms from the selected modification and leaves them enabled', () => {
      const modification: FSAT = fsat.modifications[0].fsat;
      expect(fanFieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(modification.fieldData);
      expect(operationsServiceSpy.getFormFromObj).toHaveBeenCalledWith(modification.fsatOperations);
      expect(fanMotorServiceSpy.getFormFromObj).toHaveBeenCalledWith(modification.fanMotor);
      expect(fanSetupServiceSpy.getFormFromObj).toHaveBeenCalledWith(modification.fanSetup, true);
      expect(component.modificationFieldDataForm.enabled).toBeTrue();
      expect(component.modificationFanSetupForm.enabled).toBeTrue();
    });

    it('seeds the implementation costs form from the modification', () => {
      expect(component.modifyFieldDataForm.controls.implementationCosts.value).toBe(500);
    });

    it('stores the baseline fan efficiency rounded to two decimals', () => {
      expect(fsatServiceSpy.getResults).toHaveBeenCalledWith(fsat, true, MOCK_SETTINGS);
      expect(component.baselineFanEfficiency).toBe(65.12);
    });

    it('defaults the VFD opportunity to off when the modification has none set', () => {
      const unsetFsat: FSAT = makeFsat();
      delete unsetFsat.modifications[0].exploreOppsShowVfd;
      createComponent(unsetFsat);
      expect(fsat.modifications[0].exploreOppsShowVfd).toEqual({ hasOpportunity: false, display: 'Install VFD' });
    });

    it('converts a legacy isVFD modification into a VFD opportunity and removes isVFD', () => {
      const legacyFsat: FSAT = makeFsat();
      legacyFsat.modifications[0].fsat.isVFD = true;
      createComponent(legacyFsat);
      expect(fsat.modifications[0].exploreOppsShowVfd).toEqual({ hasOpportunity: true, display: 'Install VFD' });
      expect(fsat.modifications[0].fsat.isVFD).toBeUndefined();
    });

    it('checks baseline and modification warnings on init', () => {
      expect(fsatWarningServiceSpy.checkFieldDataWarnings).toHaveBeenCalledWith(fsat, MOCK_SETTINGS, false);
      expect(fsatWarningServiceSpy.checkFieldDataWarnings).toHaveBeenCalledWith(fsat.modifications[0].fsat, MOCK_SETTINGS, true);
      expect(fsatWarningServiceSpy.checkOperationsWarnings).toHaveBeenCalledWith(fsat, MOCK_SETTINGS, false);
      expect(fsatWarningServiceSpy.checkOperationsWarnings).toHaveBeenCalledWith(fsat.modifications[0].fsat, MOCK_SETTINGS, true);
      expect(component.baselineFanFieldDataWarnings).toBe(MOCK_FIELD_DATA_WARNINGS);
      expect(component.modificationOperationsWarnings).toBe(MOCK_OPERATIONS_WARNINGS);
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => createComponent());

    it('does not rebuild forms on the first exploreModIndex change', () => {
      fanFieldDataServiceSpy.getFormFromObj.calls.reset();
      component.ngOnChanges({ exploreModIndex: new SimpleChange(undefined, 0, true) });
      expect(fanFieldDataServiceSpy.getFormFromObj).not.toHaveBeenCalled();
    });

    it('rebuilds forms when exploreModIndex changes after the first change', () => {
      fanFieldDataServiceSpy.getFormFromObj.calls.reset();
      component.ngOnChanges({ exploreModIndex: new SimpleChange(0, 0, false) });
      expect(fanFieldDataServiceSpy.getFormFromObj).toHaveBeenCalledTimes(2);
    });
  });

  describe('template visibility: variable frequency drive form', () => {
    it('hides the VFD form when there is no VFD opportunity', () => {
      createComponent(makeFsat({ hasVfdOpportunity: false }));
      expect(fixture.nativeElement.querySelector('app-variable-frequency-drive-form')).toBeNull();
    });

    it('shows the VFD form when there is a VFD opportunity', () => {
      createComponent(makeFsat({ hasVfdOpportunity: true }));
      expect(fixture.nativeElement.querySelector('app-variable-frequency-drive-form')).not.toBeNull();
    });

    it('always renders the fan data, rated motor and system data forms', () => {
      createComponent(makeFsat({ hasVfdOpportunity: false }));
      expect(fixture.nativeElement.querySelector('app-fan-data-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-rated-motor-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-system-data-form')).not.toBeNull();
    });

    it('renders the VFD checkbox label from the opportunity display text', () => {
      createComponent();
      expect(fixture.nativeElement.querySelector('label[for="modifyCalculationMethod"]').textContent).toContain('Install VFD');
    });
  });

  describe('template visibility: pressure calculators', () => {
    beforeEach(() => createComponent());

    function showCalculator(pressureCalcType: string | undefined, bodyHeight: number): void {
      component.pressureCalcType = pressureCalcType;
      component.bodyHeight = bodyHeight;
      fixture.detectChanges();
    }

    it('hides both calculators when no calculator type is selected', () => {
      showCalculator(undefined, 400);
      expect(fixture.nativeElement.querySelector('app-calculate-inlet-pressure')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-calculate-outlet-pressure')).toBeNull();
    });

    it('shows only the inlet calculator when the inlet type is selected and the body has height', () => {
      showCalculator('inlet', 400);
      expect(fixture.nativeElement.querySelector('app-calculate-inlet-pressure')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-calculate-outlet-pressure')).toBeNull();
    });

    it('shows only the outlet calculator when the outlet type is selected and the body has height', () => {
      showCalculator('outlet', 400);
      expect(fixture.nativeElement.querySelector('app-calculate-outlet-pressure')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-calculate-inlet-pressure')).toBeNull();
    });

    it('hides the inlet calculator when the inlet type is selected but the body height is 0', () => {
      showCalculator('inlet', 0);
      expect(fixture.nativeElement.querySelector('app-calculate-inlet-pressure')).toBeNull();
    });

    it('hides the outlet calculator when the outlet type is selected but the body height is 0', () => {
      showCalculator('outlet', 0);
      expect(fixture.nativeElement.querySelector('app-calculate-outlet-pressure')).toBeNull();
    });
  });

  describe('save', () => {
    beforeEach(() => createComponent());

    it('writes the implementation costs, operations, motor and fan setup from the modification forms and emits', () => {
      const emitted: boolean[] = [];
      component.emitSave.subscribe((value: boolean) => emitted.push(value));
      component.modifyFieldDataForm.controls.implementationCosts.setValue(900);

      component.save();

      const modification: FSAT = fsat.modifications[0].fsat;
      expect(modification.implementationCosts).toBe(900);
      expect(operationsServiceSpy.getObjFromForm).toHaveBeenCalledWith(component.modificationOperationsForm);
      expect(modification.fsatOperations).toEqual({ cost: 0.04 } as FsatOperations);
      expect(modification.fanMotor).toEqual({ efficiencyClass: 2 } as FanMotor);
      expect(modification.fanSetup).toEqual({ drive: 3 } as FanSetup);
      expect(emitted).toEqual([true]);
    });

    it('re-checks warnings after saving', () => {
      fsatWarningServiceSpy.checkFieldDataWarnings.calls.reset();

      component.save();

      expect(fsatWarningServiceSpy.checkFieldDataWarnings).toHaveBeenCalledTimes(2);
    });

    it('rebuilds field data from the form while keeping pressure data, plane data, rated info and calc type', () => {
      const modification: FSAT = fsat.modifications[0].fsat;
      const inletPressureData: InletPressureData = makeInletPressureData(-9);
      const outletPressureData: OutletPressureData = makeOutletPressureData(9);
      modification.fieldData.inletPressureData = inletPressureData;
      modification.fieldData.outletPressureData = outletPressureData;
      modification.fieldData.pressureCalcResultType = 'static';

      component.save();

      expect(fanFieldDataServiceSpy.getObjFromForm).toHaveBeenCalledWith(component.modificationFieldDataForm);
      expect(modification.fieldData.inletPressureData).toBe(inletPressureData);
      expect(modification.fieldData.outletPressureData).toBe(outletPressureData);
      expect(modification.fieldData.pressureCalcResultType).toBe('static');
    });

    it('calculates and stores the compressibility factor when it is not user defined', () => {
      component.save();

      expect(fanFieldDataServiceSpy.calculateCompressibilityFactor).toHaveBeenCalledTimes(1);
      expect(fsat.modifications[0].fsat.fieldData.compressibilityFactor).toBe(0.987);
    });

    it('does not calculate the compressibility factor when it is user defined', () => {
      fsat.modifications[0].fsat.fieldData.userDefinedCompressibilityFactor = true;

      component.save();

      expect(fanFieldDataServiceSpy.calculateCompressibilityFactor).not.toHaveBeenCalled();
    });
  });

  describe('getCompressibilityFactor', () => {
    beforeEach(() => createComponent());

    it('passes the modification shaft power, pressures, flow rate and gas density to the calculation', () => {
      const result: number = component.getCompressibilityFactor();

      expect(fanFieldDataServiceSpy.calculateCompressibilityFactor).toHaveBeenCalledWith({
        moverShaftPower: BASELINE_RESULTS.fanShaftPower,
        inletPressure: -1,
        outletPressure: 5,
        barometricPressure: 29.92,
        flowRate: 1000,
        specificHeatRatio: 1.4,
      }, true, BASELINE_RESULTS, MOCK_SETTINGS);
      expect(result).toBe(0.987);
    });

    it('substitutes a compressibility factor of 1 in the results input when the form value is empty', () => {
      fanFieldDataServiceSpy.getObjFromForm.and.returnValue({ ...makeFieldData(), compressibilityFactor: 0 });

      component.getCompressibilityFactor();

      const resultsInput: FSAT = fsatServiceSpy.getResults.calls.mostRecent().args[0];
      expect(resultsInput.fieldData.compressibilityFactor).toBe(1);
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('emits emitAddNewMod when the Add New Scenario button is clicked', () => {
      const emitted: boolean[] = [];
      component.emitAddNewMod.subscribe((value: boolean) => emitted.push(value));

      fixture.nativeElement.querySelector('button.btn-primary').click();

      expect(emitted).toEqual([true]);
    });

    it('saves when the modification name input changes', () => {
      spyOn(component, 'save');

      fixture.nativeElement.querySelector('#modificatonName').dispatchEvent(new Event('input'));

      expect(component.save).toHaveBeenCalled();
    });

    it('saves when the implementation costs input changes', () => {
      spyOn(component, 'save');

      fixture.nativeElement.querySelector('#implementationCosts').dispatchEvent(new Event('input'));

      expect(component.save).toHaveBeenCalled();
    });

    describe('setVFD', () => {
      it('sets the drive to specified efficiency at 95% and saves when the VFD opportunity is checked', () => {
        spyOn(component, 'save');
        fsat.modifications[0].exploreOppsShowVfd.hasOpportunity = true;

        component.setVFD();

        expect(component.modificationFanSetupForm.controls.drive.value).toBe(4);
        expect(component.modificationFanSetupForm.controls.specifiedDriveEfficiency.value).toBe(95);
        expect(component.save).toHaveBeenCalled();
      });

      it('restores the baseline drive and saves when the VFD opportunity is unchecked', () => {
        spyOn(component, 'save');
        fsat.modifications[0].exploreOppsShowVfd.hasOpportunity = false;

        component.setVFD();

        expect(component.modificationFanSetupForm.controls.drive.value).toBe(component.baselineFanSetupForm.controls.drive.value);
        expect(component.modificationFanSetupForm.controls.specifiedDriveEfficiency.value).toBe(95);
        expect(component.save).toHaveBeenCalled();
      });
    });

    describe('pressure modal', () => {
      it('opens the modal for the requested calculator, copies existing pressure data and flags the modal as open', () => {
        component.openPressureModal('inlet');

        expect(component.pressureCalcType).toBe('inlet');
        expect(component.inletPressureCopy).toEqual(fsat.modifications[0].fsat.fieldData.inletPressureData);
        expect(component.inletPressureCopy).not.toBe(fsat.modifications[0].fsat.fieldData.inletPressureData);
        expect(component.outletPressureCopy).toEqual(fsat.modifications[0].fsat.fieldData.outletPressureData);
        expect(component.inletVelocityPressureInputs).toEqual({ ductArea: 10, gasDensity: 0.07, flowRate: 1000 });
        expect(modalOpen.value).toBeTrue();
        expect(component.pressureModal.show).toHaveBeenCalled();
      });

      it('does not copy pressure data that the modification does not have', () => {
        delete fsat.modifications[0].fsat.fieldData.inletPressureData;
        delete fsat.modifications[0].fsat.fieldData.outletPressureData;

        component.openPressureModal('outlet');

        expect(component.inletPressureCopy).toBeUndefined();
        expect(component.outletPressureCopy).toBeUndefined();
      });

      it('clears the calculator type, flags the modal as closed and hides it', () => {
        component.openPressureModal('inlet');

        component.hidePressureModal();

        expect(component.pressureCalcType).toBeUndefined();
        expect(modalOpen.value).toBeFalse();
        expect(component.pressureModal.hide).toHaveBeenCalled();
      });

      it('re-enables apply and hides the modal when the changes are cancelled', () => {
        component.disableApplyData = true;

        component.resetModalData();

        expect(component.disableApplyData).toBeFalse();
        expect(component.pressureModal.hide).toHaveBeenCalled();
      });

      it('stores the calculator-reported validity as the apply button state', () => {
        component.setCalcInvalid(false);
        expect(component.disableApplyData).toBeFalse();

        component.setCalcInvalid(true);
        expect(component.disableApplyData).toBeTrue();
      });

      it('keeps the latest inlet and outlet calculator data copies', () => {
        const inletData: InletPressureData = makeInletPressureData(-3);
        const outletData: OutletPressureData = makeOutletPressureData(7);

        component.saveInletPressureCopy(inletData);
        component.saveOutletPressureCopy(outletData);

        expect(component.inletPressureCopy).toBe(inletData);
        expect(component.outletPressureCopy).toBe(outletData);
      });

      it('applies the inlet copy to the modification, patches the inlet pressure and saves', () => {
        spyOn(component, 'save');
        component.openPressureModal('inlet');
        component.saveInletPressureCopy(makeInletPressureData(-4.5));

        component.applyModalData();

        expect(fsat.modifications[0].fsat.fieldData.inletPressureData.calculatedInletPressure).toBe(-4.5);
        expect(component.modificationFieldDataForm.controls.inletPressure.value).toBe(-4.5);
        expect(component.save).toHaveBeenCalled();
        expect(component.pressureModal.hide).toHaveBeenCalled();
      });

      it('applies the outlet copy to the modification, patches the outlet pressure and saves', () => {
        spyOn(component, 'save');
        component.openPressureModal('outlet');
        component.saveOutletPressureCopy(makeOutletPressureData(8.5));

        component.applyModalData();

        expect(fsat.modifications[0].fsat.fieldData.outletPressureData.calculatedOutletPressure).toBe(8.5);
        expect(component.modificationFieldDataForm.controls.outletPressure.value).toBe(8.5);
        expect(component.save).toHaveBeenCalled();
        expect(component.pressureModal.hide).toHaveBeenCalled();
      });
    });

    describe('getBodyHeight', () => {
      it('reads the modal body height when the body exists', () => {
        component.getBodyHeight();
        expect(component.bodyHeight).toBe(component.modalBody.nativeElement.clientHeight);
      });

      it('falls back to 0 when the modal body does not exist', () => {
        component.modalBody = undefined;
        component.getBodyHeight();
        expect(component.bodyHeight).toBe(0);
      });
    });
  });

  describe('modal shown observer', () => {
    beforeEach(() => createComponent());

    it('recomputes the body height when the pressure modal is shown', () => {
      spyOn(component, 'getBodyHeight');

      component.pressureModal.onShown.emit(component.pressureModal);

      expect(component.getBodyHeight).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('stops recomputing the body height after the component is destroyed', () => {
      createComponent();
      const pressureModal = component.pressureModal;
      spyOn(component, 'getBodyHeight');

      fixture.destroy();
      pressureModal.onShown.emit(pressureModal);

      expect(component.getBodyHeight).not.toHaveBeenCalled();
    });

    it('names an unnamed modification and saves it on destroy', () => {
      createComponent(makeFsat({ name: '' }));
      const emitted: boolean[] = [];
      component.emitSave.subscribe((value: boolean) => emitted.push(value));

      fixture.destroy();

      expect(fsat.modifications[0].fsat.name).toBe('Opportunities Modification');
      expect(emitted).toEqual([true]);
    });

    it('keeps an existing modification name and does not save on destroy', () => {
      createComponent(makeFsat({ name: 'My Modification' }));
      const emitted: boolean[] = [];
      component.emitSave.subscribe((value: boolean) => emitted.push(value));

      fixture.destroy();

      expect(fsat.modifications[0].fsat.name).toBe('My Modification');
      expect(emitted).toEqual([]);
    });
  });
});
