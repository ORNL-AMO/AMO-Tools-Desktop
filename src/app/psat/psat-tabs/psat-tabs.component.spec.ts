import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PsatTabsComponent } from './psat-tabs.component';
import { PsatTabService } from '../psat-tab.service';
import { CompareService } from '../compare.service';
import { PsatService } from '../psat.service';
import { PsatWarningService } from '../psat-warning.service';
import { PumpFluidService } from '../pump-fluid/pump-fluid.service';
import { MotorService } from '../motor/motor.service';
import { FieldDataService } from '../field-data/field-data.service';
import { PumpOperationsService } from '../pump-operations/pump-operations.service';
import { ChangeDetectorRef } from '@angular/core';

const MOCK_PSAT: any = {
  inputs: {
    pump_style: 0,
    pump_specified: 0,
    pump_rated_speed: 1780,
    drive: 0,
    kinematic_viscosity: 1,
    specific_gravity: 1,
    stages: 1,
    fixed_speed: 0,
    whatIfScenario: false,
  }
};

const MOCK_SETTINGS: any = { unitsOfMeasure: 'Imperial' };

describe('PsatTabsComponent', () => {
  let component: PsatTabsComponent;
  let fixture: ComponentFixture<PsatTabsComponent>;

  beforeEach(async () => {
    const psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', ['continue', 'back'], {
      mainTab: new BehaviorSubject<string>('baseline'),
      secondaryTab: new BehaviorSubject<string>('explore-opportunities'),
      calcTab: new BehaviorSubject<string>('achievable-efficiency'),
      stepTab: new BehaviorSubject<string>('baseline'),
    });

    const compareServiceSpy = jasmine.createSpyObj('CompareService', [], {
      selectedModification: new BehaviorSubject<any>(undefined),
      openModificationModal: new BehaviorSubject<boolean>(false),
    });

    const psatServiceSpy = jasmine.createSpyObj('PsatService', [], {
      getResults: new BehaviorSubject<boolean>(false),
    });

    const mockForm: any = { invalid: false, valid: true };
    const pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', ['getFormFromObj']);
    pumpFluidServiceSpy.getFormFromObj.and.returnValue(mockForm);

    const motorServiceSpy = jasmine.createSpyObj('MotorService', ['getFormFromObj']);
    motorServiceSpy.getFormFromObj.and.returnValue(mockForm);

    const fieldDataServiceSpy = jasmine.createSpyObj('FieldDataService', ['getFormFromObj']);
    fieldDataServiceSpy.getFormFromObj.and.returnValue(mockForm);

    const pumpOperationsServiceSpy = jasmine.createSpyObj('PumpOperationsService', ['getFormFromObj']);
    pumpOperationsServiceSpy.getFormFromObj.and.returnValue(mockForm);

    const psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', [
      'checkPumpOperations',
      'checkPumpFluidWarnings',
      'checkMotorWarnings',
      'checkFieldData',
      'checkWarningsExist',
    ]);
    psatWarningServiceSpy.checkPumpOperations.and.returnValue({});
    psatWarningServiceSpy.checkPumpFluidWarnings.and.returnValue({});
    psatWarningServiceSpy.checkMotorWarnings.and.returnValue({});
    psatWarningServiceSpy.checkFieldData.and.returnValue({});
    psatWarningServiceSpy.checkWarningsExist.and.returnValue(false);

    await TestBed.configureTestingModule({
      declarations: [PsatTabsComponent],
      providers: [
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: FieldDataService, useValue: fieldDataServiceSpy },
        { provide: PumpOperationsService, useValue: pumpOperationsServiceSpy },
        ChangeDetectorRef,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PsatTabsComponent);
    component = fixture.componentInstance;
    component.psat = MOCK_PSAT;
    component.settings = MOCK_SETTINGS;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('mainTab visibility', () => {
    it('shows baseline nav when mainTab is "baseline"', () => {
      component.mainTab = 'baseline';
      fixture.detectChanges();
      const nav = fixture.nativeElement.querySelector('nav.hide-print.d-none.d-lg-block');
      expect(nav).not.toBeNull();
    });

    it('hides baseline nav when mainTab is not "baseline"', () => {
      component.mainTab = 'assessment';
      fixture.detectChanges();
      const nav = fixture.nativeElement.querySelector('nav.hide-print.d-none.d-lg-block');
      expect(nav).toBeNull();
    });

    it('shows assessment bar when mainTab is "assessment"', () => {
      component.mainTab = 'assessment';
      fixture.detectChanges();
      const bar = fixture.nativeElement.querySelector('.navbar.assessment-bar');
      expect(bar).not.toBeNull();
    });

    it('hides assessment bar when mainTab is not "assessment"', () => {
      component.mainTab = 'baseline';
      fixture.detectChanges();
      const bar = fixture.nativeElement.querySelector('.navbar.assessment-bar');
      expect(bar).toBeNull();
    });

    it('shows calculators tabs when mainTab is "calculators"', () => {
      component.mainTab = 'calculators';
      fixture.detectChanges();
      const calcDiv = fixture.nativeElement.querySelector('.d-none.d-lg-block');
      expect(calcDiv).not.toBeNull();
    });
  });

  describe('selectedModification visibility', () => {
    it('shows selected modification name when selectedModification exists', () => {
      component.mainTab = 'assessment';
      component.selectedModification = { name: 'Mod 1' } as any;
      fixture.detectChanges();
      const modName = fixture.nativeElement.querySelector('.mod-name.active.border-right');
      expect(modName).not.toBeNull();
    });

    it('shows placeholder when no selectedModification', () => {
      component.mainTab = 'assessment';
      component.selectedModification = undefined;
      fixture.detectChanges();
      const placeholder = fixture.nativeElement.querySelector('.mod-name.border-right');
      expect(placeholder).not.toBeNull();
    });
  });

  describe('calcTabsCollapsed', () => {
    it('shows caret-up when calcTabsCollapsed is false', () => {
      component.mainTab = 'calculators';
      component.calcTabsCollapsed = false;
      fixture.detectChanges();
      const caretUp = fixture.nativeElement.querySelector('.fa.fa-caret-up');
      expect(caretUp).not.toBeNull();
    });

    it('shows caret-down when calcTabsCollapsed is true', () => {
      component.mainTab = 'calculators';
      component.calcTabsCollapsed = true;
      fixture.detectChanges();
      const caretDown = fixture.nativeElement.querySelector('.fa.fa-caret-down');
      expect(caretDown).not.toBeNull();
    });
  });
});
