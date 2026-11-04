import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FsatTabsComponent } from './fsat-tabs.component';
import { FsatService } from '../fsat.service';
import { CompareService } from '../compare.service';
import { FsatFluidService } from '../fsat-fluid/fsat-fluid.service';
import { FanMotorService } from '../fan-motor/fan-motor.service';
import { FanFieldDataService } from '../fan-field-data/fan-field-data.service';
import { FanSetupService } from '../fan-setup/fan-setup.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';
import { FsatWarningService, FanMotorWarnings, FanFieldDataWarnings } from '../fsat-warning.service';
import { OperationsService } from '../operations/operations.service';
import { FsatMainView } from '../routing/fsat-main-views';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const DASH = '—';

type Badge = { display: boolean; hover: boolean };

function makeFsat(name: string = 'fsat'): FSAT {
  return { name, fsatOperations: {}, baseGasDensity: {}, fanSetup: {}, fanMotor: {}, fieldData: {} } as FSAT;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FsatTabsComponent', () => {
  let component: FsatTabsComponent;
  let fixture: ComponentFixture<FsatTabsComponent>;
  let host: HTMLElement;

  let mainTab: BehaviorSubject<FsatMainView>;
  let stepTab: BehaviorSubject<string>;
  let assessmentTab: BehaviorSubject<string>;
  let calculatorTab: BehaviorSubject<string>;
  let updateData: BehaviorSubject<boolean>;
  let openModificationModal: BehaviorSubject<boolean>;
  let selectedModification: BehaviorSubject<FSAT>;
  let modifyConditionsTab: BehaviorSubject<string>;

  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let fluidSpy: jasmine.SpyObj<FsatFluidService>;
  let motorSpy: jasmine.SpyObj<FanMotorService>;
  let fieldDataSpy: jasmine.SpyObj<FanFieldDataService>;
  let setupSpy: jasmine.SpyObj<FanSetupService>;
  let operationsSpy: jasmine.SpyObj<OperationsService>;
  let warningSpy: jasmine.SpyObj<FsatWarningService>;

  beforeEach(async () => {
    mainTab = new BehaviorSubject<FsatMainView>('baseline');
    stepTab = new BehaviorSubject<string>('baseline');
    assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    calculatorTab = new BehaviorSubject<string>('fan-efficiency');
    updateData = new BehaviorSubject<boolean>(false);
    openModificationModal = new BehaviorSubject<boolean>(false);
    selectedModification = new BehaviorSubject<FSAT>(undefined);
    modifyConditionsTab = new BehaviorSubject<string>('fan-operations');

    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['continue', 'back'], {
      mainTab, stepTab, assessmentTab, calculatorTab, updateData, openModificationModal,
    });
    fluidSpy = jasmine.createSpyObj('FsatFluidService', ['isFanFluidValid']);
    fluidSpy.isFanFluidValid.and.returnValue(true);
    motorSpy = jasmine.createSpyObj('FanMotorService', ['isFanMotorValid']);
    motorSpy.isFanMotorValid.and.returnValue(true);
    fieldDataSpy = jasmine.createSpyObj('FanFieldDataService', ['isFanFieldDataValid']);
    fieldDataSpy.isFanFieldDataValid.and.returnValue(true);
    setupSpy = jasmine.createSpyObj('FanSetupService', ['isFanSetupValid']);
    setupSpy.isFanSetupValid.and.returnValue(true);
    operationsSpy = jasmine.createSpyObj('OperationsService', ['isOperationsDataValid']);
    operationsSpy.isOperationsDataValid.and.returnValue(true);
    warningSpy = jasmine.createSpyObj('FsatWarningService', ['checkFanWarnings', 'checkMotorWarnings', 'checkFieldDataWarnings', 'checkWarningsExist']);
    warningSpy.checkFanWarnings.and.returnValue({ fanSpeedError: null });
    warningSpy.checkMotorWarnings.and.returnValue({} as FanMotorWarnings);
    warningSpy.checkFieldDataWarnings.and.returnValue({} as FanFieldDataWarnings);
    warningSpy.checkWarningsExist.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [FsatTabsComponent],
      providers: [
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: CompareService, useValue: jasmine.createSpyObj('CompareService', [], { selectedModification }) },
        { provide: FsatFluidService, useValue: fluidSpy },
        { provide: FanMotorService, useValue: motorSpy },
        { provide: FanFieldDataService, useValue: fieldDataSpy },
        { provide: FanSetupService, useValue: setupSpy },
        { provide: ModifyConditionsService, useValue: jasmine.createSpyObj('ModifyConditionsService', [], { modifyConditionsTab }) },
        { provide: FsatWarningService, useValue: warningSpy },
        { provide: OperationsService, useValue: operationsSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(FsatTabsComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    component.settings = { unitsOfMeasure: 'Imperial' } as Settings;
    component.fsat = makeFsat();
    fixture.detectChanges();
  }

  function showMainTab(view: FsatMainView, step?: string): void {
    mainTab.next(view);
    if (step) {
      stepTab.next(step);
    }
    createComponent();
  }

  function desktopStepTabs(): HTMLElement[] {
    return Array.from(host.querySelectorAll('nav.d-lg-block .fixed-tab-size'));
  }

  function mobileStepNav(): HTMLElement {
    return host.querySelector('nav.d-lg-none');
  }

  function mobileStepItems(): HTMLElement[] {
    return Array.from(host.querySelectorAll('nav.d-lg-none .pagination li.page-item'));
  }

  function assessmentBar(): HTMLElement {
    return host.querySelector('.assessment-bar');
  }

  function desktopModName(): HTMLElement {
    return assessmentBar().querySelector('.d-md-flex .mod-name');
  }

  function mobileModName(): HTMLElement {
    return assessmentBar().querySelector('.d-md-none .mod-name');
  }

  function mobileAssessmentTabs(): HTMLElement[] {
    return Array.from(assessmentBar().querySelectorAll('.d-md-none .assessment-tab'));
  }

  function desktopCalcTabs(): HTMLElement[] {
    return Array.from(host.querySelectorAll('div.d-lg-block ul li'));
  }

  function mobileCalcMenu(): HTMLElement {
    return host.querySelector('.d-lg-none.flex-column');
  }

  describe('initialization', () => {
    it('creates the component', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('reads the current tabs from the services', () => {
      mainTab.next('assessment');
      stepTab.next('fan-motor');
      assessmentTab.next('modify-conditions');
      calculatorTab.next('fan-curve');
      modifyConditionsTab.next('fan-setup');
      createComponent();

      expect(component.mainTab).toBe('assessment');
      expect(component.stepTab).toBe('fan-motor');
      expect(component.assessmentTab).toBe('modify-conditions');
      expect(component.calcTab).toBe('fan-curve');
      expect(component.modifyConditionsTab).toBe('fan-setup');
    });

    it('reads the selected modification from the compare service', () => {
      const modification = makeFsat('Scenario 1');
      selectedModification.next(modification);
      createComponent();
      expect(component.selectedModification).toBe(modification);
    });

    it('starts with the tab menus collapsed', () => {
      createComponent();
      expect(component.tabsCollapsed).toBeTrue();
      expect(component.calcTabsCollapsed).toBeTrue();
    });

    it('checks the status of every tab with the current settings', () => {
      createComponent();
      expect(operationsSpy.isOperationsDataValid).toHaveBeenCalledWith(component.fsat.fsatOperations);
      expect(fluidSpy.isFanFluidValid).toHaveBeenCalledWith(component.fsat.baseGasDensity, component.settings);
      expect(setupSpy.isFanSetupValid).toHaveBeenCalledWith(component.fsat.fanSetup, false);
      expect(motorSpy.isFanMotorValid).toHaveBeenCalledWith(component.fsat.fanMotor);
      expect(fieldDataSpy.isFanFieldDataValid).toHaveBeenCalledWith(component.fsat.fieldData);
    });
  });

  describe('observers', () => {
    beforeEach(() => createComponent());

    it('updates the main tab when the service emits', () => {
      mainTab.next('calculators');
      expect(component.mainTab).toBe('calculators');
    });

    it('updates the assessment tab when the service emits', () => {
      assessmentTab.next('modify-conditions');
      expect(component.assessmentTab).toBe('modify-conditions');
    });

    it('updates the calculator tab when the service emits', () => {
      calculatorTab.next('motor-performance');
      expect(component.calcTab).toBe('motor-performance');
    });

    it('updates the modify conditions tab when the service emits', () => {
      modifyConditionsTab.next('fan-motor');
      expect(component.modifyConditionsTab).toBe('fan-motor');
    });

    it('updates the selected modification and re-renders when the compare service emits', () => {
      mainTab.next('assessment');
      selectedModification.next(makeFsat('Scenario 2'));
      expect(component.selectedModification.name).toBe('Scenario 2');
      expect(desktopModName().textContent).toContain('Scenario 2');
    });

    it('rechecks tab statuses when the step tab changes', () => {
      motorSpy.isFanMotorValid.and.returnValue(false);
      stepTab.next('fan-motor');
      expect(component.motorClassStatus).toEqual(['missing-data', 'active']);
    });

    it('rechecks tab statuses when the assessment data updates', () => {
      motorSpy.isFanMotorValid.and.returnValue(false);
      updateData.next(true);
      expect(component.motorClassStatus).toEqual(['missing-data']);
    });
  });

  describe('template visibility', () => {
    describe('baseline main tab', () => {
      it('shows both step navs on the baseline main tab', () => {
        showMainTab('baseline');
        expect(host.querySelector('nav.d-lg-block')).not.toBeNull();
        expect(mobileStepNav()).not.toBeNull();
      });

      (['assessment', 'calculators', 'report'] satisfies Array<FsatMainView>).forEach(view => {
        it(`hides both step navs when the main tab is ${view}`, () => {
          showMainTab(view);
          expect(host.querySelector('nav.d-lg-block')).toBeNull();
          expect(mobileStepNav()).toBeNull();
        });
      });

      it('renders the five desktop step tabs in order', () => {
        showMainTab('baseline');
        const labels = desktopStepTabs().map(t => normalize(t.querySelector('a').textContent));
        expect(labels.length).toBe(5);
        expect(labels[0]).toContain('Assessment Settings');
        expect(labels[1]).toContain('Operations');
        expect(labels[2]).toContain('Fan and Fluid');
        expect(labels[3]).toContain('Motor');
        expect(labels[4]).toContain('Field Data');
      });

      it('applies the status classes to the desktop step tabs', () => {
        motorSpy.isFanMotorValid.and.returnValue(false);
        showMainTab('baseline', 'fan-motor');
        const tabs = desktopStepTabs();
        expect(tabs[3].classList).toContain('missing-data');
        expect(tabs[3].classList).toContain('active');
        expect(tabs[0].classList).toContain('success');
      });
    });

    describe('mobile step item', () => {
      const steps: Array<{ step: string; label: string }> = [
        { step: 'baseline', label: 'Assessment Settings' },
        { step: 'fan-operations', label: 'Operations' },
        { step: 'fan-setup', label: 'Fan & Fluid' },
        { step: 'fan-motor', label: 'Motor' },
        { step: 'fan-field-data', label: 'Field Data' },
      ];

      steps.forEach(({ step, label }) => {
        it(`shows only the ${label} item between the back and continue buttons when the step is ${step}`, () => {
          showMainTab('baseline', step);
          const items = mobileStepItems();
          expect(items.length).toBe(3);
          expect(normalize(items[1].textContent)).toContain(label);
          expect(items[1].classList).toContain('active');
        });
      });

      it('shows no step item when the step is not one of the steps', () => {
        showMainTab('baseline', 'fsat-fluid');
        expect(mobileStepItems().length).toBe(2);
      });

      it('disables the back button only on the first step', () => {
        showMainTab('baseline', 'baseline');
        expect(mobileStepItems()[0].classList).toContain('disabled');

        stepTab.next('fan-operations');
        fixture.detectChanges();
        expect(mobileStepItems()[0].classList).not.toContain('disabled');
      });

      it('switches the visible step when the step tab changes', () => {
        showMainTab('baseline', 'fan-operations');
        expect(normalize(mobileStepItems()[1].textContent)).toContain('Operations');

        stepTab.next('fan-motor');
        fixture.detectChanges();

        expect(mobileStepItems().length).toBe(3);
        expect(normalize(mobileStepItems()[1].textContent)).toContain('Motor');
        expect(normalize(mobileStepItems()[1].textContent)).not.toContain('Operations');
      });
    });

    describe('assessment main tab', () => {
      (['baseline', 'calculators', 'report'] satisfies Array<FsatMainView>).forEach(view => {
        it(`hides the assessment bar when the main tab is ${view}`, () => {
          showMainTab(view);
          expect(assessmentBar()).toBeNull();
        });
      });

      it('shows the assessment bar with the assessment tabs', () => {
        showMainTab('assessment');
        expect(assessmentBar()).not.toBeNull();
        const desktopTabs = Array.from(assessmentBar().querySelectorAll('.d-md-flex .assessment-tab'));
        expect(desktopTabs.map(t => normalize(t.textContent))).toEqual(['Explore Opportunities', 'Expert View']);
      });

      it('marks the current assessment tab as active', () => {
        assessmentTab.next('modify-conditions');
        showMainTab('assessment');
        const desktopTabs = Array.from(assessmentBar().querySelectorAll('.d-md-flex .assessment-tab'));
        expect(desktopTabs.map(t => t.classList.contains('active'))).toEqual([false, true]);
      });

      describe('selected scenario', () => {
        it('shows dashes and a disabled view button when no modification is selected', () => {
          selectedModification.next(undefined);
          showMainTab('assessment');

          expect(desktopModName().classList).not.toContain('active');
          expect(desktopModName().textContent).toContain(DASH);
          expect(mobileModName().classList).not.toContain('active');
          expect(mobileModName().textContent).toContain(DASH);
          expect(assessmentBar().querySelector('.d-md-flex button').hasAttribute('disabled')).toBeTrue();
        });

        it('shows the modification name and an enabled view button when a modification is selected', () => {
          selectedModification.next(makeFsat('Scenario 1'));
          showMainTab('assessment');

          expect(desktopModName().classList).toContain('active');
          expect(normalize(desktopModName().textContent)).toContain('Scenario 1');
          expect(desktopModName().textContent).not.toContain(DASH);
          expect(mobileModName().classList).toContain('active');
          expect(normalize(mobileModName().textContent)).toContain('Scenario 1');
          expect(assessmentBar().querySelector('.d-md-flex button').hasAttribute('disabled')).toBeFalse();
        });

        it('swaps between the dash and the name when the selection changes', () => {
          selectedModification.next(undefined);
          showMainTab('assessment');
          expect(desktopModName().textContent).toContain(DASH);

          selectedModification.next(makeFsat('Scenario 3'));
          expect(normalize(desktopModName().textContent)).toContain('Scenario 3');
          expect(desktopModName().textContent).not.toContain(DASH);
        });
      });

      describe('mobile menu', () => {
        it('shows the Menu toggle with a down caret and no assessment tabs when collapsed', () => {
          showMainTab('assessment');
          expect(component.tabsCollapsed).toBeTrue();
          expect(assessmentBar().querySelector('.fa-caret-down')).not.toBeNull();
          expect(assessmentBar().querySelector('.fa-caret-up')).toBeNull();
          expect(mobileAssessmentTabs().length).toBe(0);
        });

        it('shows the assessment tabs and an up caret when expanded', () => {
          showMainTab('assessment');
          component.collapseTabs();
          fixture.detectChanges();

          expect(assessmentBar().querySelector('.fa-caret-up')).not.toBeNull();
          expect(assessmentBar().querySelector('.fa-caret-down')).toBeNull();
          expect(mobileAssessmentTabs().map(t => normalize(t.textContent))).toEqual(['Explore Opportunities', 'Expert View']);
        });

        it('expands when the collapsed Menu toggle is clicked and collapses when the up caret Menu toggle is clicked', () => {
          showMainTab('assessment');
          (assessmentBar().querySelector('.fa-caret-down').parentElement as HTMLElement).click();
          fixture.detectChanges();
          expect(mobileAssessmentTabs().length).toBe(2);

          (assessmentBar().querySelector('.fa-caret-up').parentElement as HTMLElement).click();
          fixture.detectChanges();
          expect(mobileAssessmentTabs().length).toBe(0);
        });
      });

      describe('expert view tabs', () => {
        it('hides the modify conditions tabs when the assessment tab is explore-opportunities', () => {
          assessmentTab.next('explore-opportunities');
          showMainTab('assessment');
          expect(assessmentBar().querySelector('app-modify-conditions-tabs')).toBeNull();
        });

        it('shows the modify conditions tabs when the assessment tab is modify-conditions', () => {
          assessmentTab.next('modify-conditions');
          showMainTab('assessment');
          expect(assessmentBar().querySelector('app-modify-conditions-tabs')).not.toBeNull();
        });
      });
    });

    describe('calculators main tab', () => {
      const calcLabels = ['Optimal Fan Efficiency', 'Motor Performance', 'NEMA Energy Efficiency', 'Fan Curve'];

      (['baseline', 'assessment', 'report'] satisfies Array<FsatMainView>).forEach(view => {
        it(`hides the calculator tabs when the main tab is ${view}`, () => {
          showMainTab(view);
          expect(desktopCalcTabs().length).toBe(0);
          expect(mobileCalcMenu()).toBeNull();
        });
      });

      it('shows the four desktop calculator tabs', () => {
        showMainTab('calculators');
        expect(desktopCalcTabs().map(t => normalize(t.textContent))).toEqual(calcLabels);
      });

      it('marks the current calculator tab as active', () => {
        calculatorTab.next('fan-curve');
        showMainTab('calculators');
        expect(desktopCalcTabs().map(t => t.classList.contains('active'))).toEqual([false, false, false, true]);
      });

      it('shows the four mobile calculator links', () => {
        showMainTab('calculators');
        const links = Array.from(mobileCalcMenu().querySelectorAll('a'));
        expect(links.map(a => normalize(a.textContent))).toEqual(calcLabels);
      });

      it('shows the down caret and collapses the mobile links when collapsed', () => {
        showMainTab('calculators');
        expect(mobileCalcMenu().querySelector('.fa-caret-down')).not.toBeNull();
        expect(mobileCalcMenu().querySelector('.fa-caret-up')).toBeNull();
        expect(mobileCalcMenu().querySelectorAll('.collapse').length).toBe(4);
      });

      it('shows the up caret and expands the mobile links when expanded', () => {
        showMainTab('calculators');
        component.collapseCalcTabs();
        fixture.detectChanges();

        expect(mobileCalcMenu().querySelector('.fa-caret-up')).not.toBeNull();
        expect(mobileCalcMenu().querySelector('.fa-caret-down')).toBeNull();
        expect(mobileCalcMenu().querySelectorAll('.collapse').length).toBe(0);
      });

      it('toggles between the carets when the Menu toggle is clicked', () => {
        showMainTab('calculators');
        (mobileCalcMenu().querySelector('.fa-caret-down').parentElement as HTMLElement).click();
        fixture.detectChanges();
        expect(mobileCalcMenu().querySelector('.fa-caret-up')).not.toBeNull();

        (mobileCalcMenu().querySelector('.fa-caret-up').parentElement as HTMLElement).click();
        fixture.detectChanges();
        expect(mobileCalcMenu().querySelector('.fa-caret-down')).not.toBeNull();
      });
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    describe('changeStepTab', () => {
      it('moves to fan-motor when fluid, fan and operations are valid', () => {
        component.changeStepTab('fan-motor');
        expect(stepTab.value).toBe('fan-motor');
      });

      [
        { name: 'fluid', spy: () => fluidSpy.isFanFluidValid },
        { name: 'fan', spy: () => setupSpy.isFanSetupValid },
        { name: 'operations', spy: () => operationsSpy.isOperationsDataValid },
      ].forEach(({ name, spy }) => {
        it(`stays on the current step for fan-motor when ${name} is invalid`, () => {
          spy().and.returnValue(false);
          component.changeStepTab('fan-motor');
          expect(stepTab.value).toBe('baseline');
        });
      });

      it('moves to fan-field-data when fluid, fan, motor and operations are valid', () => {
        component.changeStepTab('fan-field-data');
        expect(stepTab.value).toBe('fan-field-data');
      });

      [
        { name: 'fluid', spy: () => fluidSpy.isFanFluidValid },
        { name: 'fan', spy: () => setupSpy.isFanSetupValid },
        { name: 'motor', spy: () => motorSpy.isFanMotorValid },
        { name: 'operations', spy: () => operationsSpy.isOperationsDataValid },
      ].forEach(({ name, spy }) => {
        it(`stays on the current step for fan-field-data when ${name} is invalid`, () => {
          spy().and.returnValue(false);
          component.changeStepTab('fan-field-data');
          expect(stepTab.value).toBe('baseline');
        });
      });

      ['operations', 'baseline', 'fan-setup'].forEach(step => {
        it(`moves to ${step} even when the data is invalid`, () => {
          fluidSpy.isFanFluidValid.and.returnValue(false);
          setupSpy.isFanSetupValid.and.returnValue(false);
          motorSpy.isFanMotorValid.and.returnValue(false);
          operationsSpy.isOperationsDataValid.and.returnValue(false);
          component.changeStepTab(step);
          expect(stepTab.value).toBe(step);
        });
      });
    });

    describe('changeAssessmentTab', () => {
      it('publishes the tab and toggles the collapsed state', () => {
        component.changeAssessmentTab('modify-conditions');
        expect(assessmentTab.value).toBe('modify-conditions');
        expect(component.tabsCollapsed).toBeFalse();
      });
    });

    describe('selectModification', () => {
      it('requests the modification modal and toggles the collapsed state', () => {
        component.selectModification();
        expect(openModificationModal.value).toBeTrue();
        expect(component.tabsCollapsed).toBeFalse();
      });
    });

    describe('changeCalcTab', () => {
      it('publishes the calculator tab and toggles the calculator collapsed state', () => {
        component.changeCalcTab('fan-curve');
        expect(calculatorTab.value).toBe('fan-curve');
        expect(component.calcTabsCollapsed).toBeFalse();
      });
    });

    describe('continue and back', () => {
      it('delegates continue to the fsat service', () => {
        component.continue();
        expect(fsatServiceSpy.continue).toHaveBeenCalled();
      });

      it('delegates back to the fsat service', () => {
        component.back();
        expect(fsatServiceSpy.back).toHaveBeenCalled();
      });
    });

    describe('tooltips', () => {
      const badges: Array<{ name: string; badge: () => Badge }> = [
        { name: 'operations', badge: () => component.operationsBadge },
        { name: 'fan', badge: () => component.fanBadge },
        { name: 'fluid', badge: () => component.fluidBadge },
        { name: 'motor', badge: () => component.motorBadge },
        { name: 'field data', badge: () => component.fieldDataBadge },
      ];

      badges.forEach(({ name, badge }) => {
        it(`reveals the ${name} tooltip after hovering for a second`, fakeAsync(() => {
          component.showTooltip(badge());
          expect(badge().hover).toBeTrue();
          expect(badge().display).toBeFalse();

          tick(1000);

          expect(badge().display).toBeTrue();
        }));

        it(`does not reveal the ${name} tooltip when the pointer leaves before a second`, fakeAsync(() => {
          component.showTooltip(badge());
          component.hideTooltip(badge());

          tick(1000);

          expect(badge().hover).toBeFalse();
          expect(badge().display).toBeFalse();
        }));
      });
    });
  });

  describe('tab status', () => {
    beforeEach(() => createComponent());

    describe('checkSettingsStatus', () => {
      it('is active and success on the baseline step', () => {
        component.stepTab = 'baseline';
        component.checkSettingsStatus();
        expect(component.settingsClassStatus).toEqual(['active', 'success']);
      });

      it('is only success on other steps', () => {
        component.stepTab = 'fan-motor';
        component.checkSettingsStatus();
        expect(component.settingsClassStatus).toEqual(['success']);
      });
    });

    describe('checkOperationsStatus', () => {
      it('is missing-data when the operations are invalid', () => {
        operationsSpy.isOperationsDataValid.and.returnValue(false);
        component.checkOperationsStatus(component.settings);
        expect(component.operationsTabStatus).toEqual(['missing-data']);
      });

      it('is success when the operations are valid', () => {
        component.checkOperationsStatus(component.settings);
        expect(component.operationsTabStatus).toEqual(['success']);
      });

      it('adds active on the fan-operations step', () => {
        component.stepTab = 'fan-operations';
        component.checkOperationsStatus(component.settings);
        expect(component.operationsTabStatus).toEqual(['success', 'active']);
      });
    });

    describe('checkFluidStatus', () => {
      it('is missing-data when the fluid is invalid', () => {
        fluidSpy.isFanFluidValid.and.returnValue(false);
        component.checkFluidStatus(component.settings);
        expect(component.fluidClassStatus).toEqual(['missing-data']);
      });

      it('is success when the fluid is valid', () => {
        component.checkFluidStatus(component.settings);
        expect(component.fluidClassStatus).toEqual(['success']);
      });

      it('adds active on the fan-setup step', () => {
        component.stepTab = 'fan-setup';
        component.checkFluidStatus(component.settings);
        expect(component.fluidClassStatus).toEqual(['success', 'active']);
      });
    });

    describe('checkFanStatus', () => {
      it('is disabled when the fluid is invalid', () => {
        fluidSpy.isFanFluidValid.and.returnValue(false);
        component.checkFanStatus(component.settings);
        expect(component.fanClassStatus).toEqual(['disabled']);
      });

      it('is missing-data when the fan setup is invalid', () => {
        setupSpy.isFanSetupValid.and.returnValue(false);
        component.checkFanStatus(component.settings);
        expect(component.fanClassStatus).toEqual(['missing-data']);
      });

      it('is input-error when the fan has warnings', () => {
        warningSpy.checkWarningsExist.and.returnValue(true);
        component.checkFanStatus(component.settings);
        expect(component.fanClassStatus).toEqual(['input-error']);
      });

      it('is success when everything is valid without warnings', () => {
        component.checkFanStatus(component.settings);
        expect(component.fanClassStatus).toEqual(['success']);
      });

      it('adds active on the fan-setup step', () => {
        component.stepTab = 'fan-setup';
        component.checkFanStatus(component.settings);
        expect(component.fanClassStatus).toEqual(['success', 'active']);
      });
    });

    describe('checkMotorStatus', () => {
      it('is disabled when the fluid is invalid', () => {
        fluidSpy.isFanFluidValid.and.returnValue(false);
        component.checkMotorStatus(component.settings);
        expect(component.motorClassStatus).toEqual(['disabled']);
      });

      it('is disabled when the fan setup is invalid', () => {
        setupSpy.isFanSetupValid.and.returnValue(false);
        component.checkMotorStatus(component.settings);
        expect(component.motorClassStatus).toEqual(['disabled']);
      });

      it('is missing-data when the motor is invalid', () => {
        motorSpy.isFanMotorValid.and.returnValue(false);
        component.checkMotorStatus(component.settings);
        expect(component.motorClassStatus).toEqual(['missing-data']);
      });

      it('is input-error when the motor has warnings', () => {
        warningSpy.checkWarningsExist.and.returnValue(true);
        component.checkMotorStatus(component.settings);
        expect(component.motorClassStatus).toEqual(['input-error']);
      });

      it('is success when everything is valid without warnings', () => {
        component.checkMotorStatus(component.settings);
        expect(component.motorClassStatus).toEqual(['success']);
      });

      it('adds active on the fan-motor step', () => {
        component.stepTab = 'fan-motor';
        component.checkMotorStatus(component.settings);
        expect(component.motorClassStatus).toEqual(['success', 'active']);
      });
    });

    describe('checkFieldDataSatus', () => {
      [
        { name: 'fluid', spy: () => fluidSpy.isFanFluidValid },
        { name: 'motor', spy: () => motorSpy.isFanMotorValid },
        { name: 'fan setup', spy: () => setupSpy.isFanSetupValid },
      ].forEach(({ name, spy }) => {
        it(`is disabled when the ${name} is invalid`, () => {
          spy().and.returnValue(false);
          component.checkFieldDataSatus(component.settings);
          expect(component.fieldDataClassStatus).toEqual(['disabled']);
        });
      });

      it('is missing-data when the field data is invalid', () => {
        fieldDataSpy.isFanFieldDataValid.and.returnValue(false);
        component.checkFieldDataSatus(component.settings);
        expect(component.fieldDataClassStatus).toEqual(['missing-data']);
      });

      it('is input-error when the field data has warnings', () => {
        warningSpy.checkWarningsExist.and.returnValue(true);
        component.checkFieldDataSatus(component.settings);
        expect(component.fieldDataClassStatus).toEqual(['input-error']);
      });

      it('is success when everything is valid without warnings', () => {
        component.checkFieldDataSatus(component.settings);
        expect(component.fieldDataClassStatus).toEqual(['success']);
      });

      it('adds active on the fan-field-data step', () => {
        component.stepTab = 'fan-field-data';
        component.checkFieldDataSatus(component.settings);
        expect(component.fieldDataClassStatus).toEqual(['success', 'active']);
      });
    });

    describe('getCanContinue', () => {
      ['baseline', 'fan-operations'].forEach(step => {
        it(`is always true on ${step}`, () => {
          component.stepTab = step;
          expect(component.getCanContinue()).toBeTrue();
        });
      });

      [
        { step: 'fsat-fluid', spy: () => fluidSpy.isFanFluidValid },
        { step: 'fan-setup', spy: () => setupSpy.isFanSetupValid },
        { step: 'fan-motor', spy: () => motorSpy.isFanMotorValid },
        { step: 'fan-field-data', spy: () => fieldDataSpy.isFanFieldDataValid },
      ].forEach(({ step, spy }) => {
        it(`follows the validity of the ${step} data`, () => {
          component.stepTab = step;
          spy().and.returnValue(true);
          expect(component.getCanContinue()).toBeTrue();
          spy().and.returnValue(false);
          expect(component.getCanContinue()).toBeFalse();
        });
      });

      it('is undefined on an unknown step', () => {
        component.stepTab = 'unknown';
        expect(component.getCanContinue()).toBeUndefined();
      });
    });
  });

  describe('destroy', () => {
    beforeEach(() => createComponent());

    it('stops tracking tab changes after the component is destroyed', () => {
      fixture.destroy();
      mainTab.next('assessment');
      assessmentTab.next('modify-conditions');
      calculatorTab.next('fan-curve');
      modifyConditionsTab.next('fan-motor');

      expect(component.mainTab).toBe('baseline');
      expect(component.assessmentTab).toBe('explore-opportunities');
      expect(component.calcTab).toBe('fan-efficiency');
      expect(component.modifyConditionsTab).toBe('fan-operations');
    });

    it('stops tracking the selected modification after the component is destroyed', () => {
      fixture.destroy();
      selectedModification.next(makeFsat('Late'));
      expect(component.selectedModification).toBeUndefined();
    });

    it('stops rechecking statuses after the component is destroyed', () => {
      fixture.destroy();
      operationsSpy.isOperationsDataValid.calls.reset();
      stepTab.next('fan-motor');
      updateData.next(true);
      expect(operationsSpy.isOperationsDataValid).not.toHaveBeenCalled();
    });
  });
});
