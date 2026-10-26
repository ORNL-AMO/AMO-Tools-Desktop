import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ModifyConditionsTabsComponent } from './modify-conditions-tabs.component';
import { ModifyConditionsService } from '../modify-conditions.service';
import { CompareService } from '../../compare.service';
import { FsatFluidService } from '../../fsat-fluid/fsat-fluid.service';
import { FanMotorService } from '../../fan-motor/fan-motor.service';
import { FanFieldDataService } from '../../fan-field-data/fan-field-data.service';
import { FanSetupService } from '../../fan-setup/fan-setup.service';
import { FsatService } from '../../fsat.service';
import { FsatWarningService, FanFieldDataWarnings, FanMotorWarnings } from '../../fsat-warning.service';
import { OperationsService } from '../../operations/operations.service';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

const TABS_IN_ORDER: Array<{ tab: string; label: string; desktopLabel: string }> = [
  { tab: 'fan-operations', label: 'Operations', desktopLabel: 'Operations' },
  { tab: 'fan-setup', label: 'Fan & Fluid', desktopLabel: 'Fan and Fluid' },
  { tab: 'fan-motor', label: 'Motor', desktopLabel: 'Motor' },
  { tab: 'fan-field-data', label: 'Field Data', desktopLabel: 'Field Data' },
];

type BadgeClassProp = 'fanOperationsBadgeClass' | 'fanSetupBadgeClass' | 'fanMotorBadgeClass' | 'fieldDataBadgeClass' | 'fluidBadgeClass';
type TooltipFlagProp = 'fanOperationsBadgeHover' | 'fanSetupBadgeHover' | 'fanMotorBadgeHover' | 'fieldDataBadgeHover' | 'fluidBadgeHover'
  | 'displayFanOperationsTooltip' | 'displayFanSetupTooltip' | 'displayFanMotorTooltip' | 'displayFieldDataTooltip' | 'displayFluidTooltip';

function makeFsat(name: string): FSAT {
  return { name } as FSAT;
}

describe('ModifyConditionsTabsComponent', () => {
  let component: ModifyConditionsTabsComponent;
  let fixture: ComponentFixture<ModifyConditionsTabsComponent>;
  let host: HTMLElement;

  let tabSubject: BehaviorSubject<string>;
  let updateDataSubject: BehaviorSubject<boolean>;
  let compareSpy: jasmine.SpyObj<CompareService>;
  let fluidSpy: jasmine.SpyObj<FsatFluidService>;
  let motorSpy: jasmine.SpyObj<FanMotorService>;
  let fieldDataSpy: jasmine.SpyObj<FanFieldDataService>;
  let setupSpy: jasmine.SpyObj<FanSetupService>;
  let operationsSpy: jasmine.SpyObj<OperationsService>;
  let warningSpy: jasmine.SpyObj<FsatWarningService>;
  let baselineFsat: FSAT;

  beforeEach(async () => {
    baselineFsat = makeFsat('baseline');
    tabSubject = new BehaviorSubject<string>('fan-operations');
    updateDataSubject = new BehaviorSubject<boolean>(false);

    compareSpy = jasmine.createSpyObj(
      'CompareService',
      ['checkFluidDifferent', 'checkFanMotorDifferent', 'checkFanFieldDataDifferent', 'checkFanSetupDifferent', 'checkFanOperationsDifferent'],
      { baselineFSAT: baselineFsat, modifiedFSAT: undefined }
    );
    compareSpy.checkFluidDifferent.and.returnValue(false);
    compareSpy.checkFanMotorDifferent.and.returnValue(false);
    compareSpy.checkFanFieldDataDifferent.and.returnValue(false);
    compareSpy.checkFanSetupDifferent.and.returnValue(false);
    compareSpy.checkFanOperationsDifferent.and.returnValue(false);

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

    warningSpy = jasmine.createSpyObj('FsatWarningService', ['checkFieldDataWarnings', 'checkOperationsWarnings', 'checkMotorWarnings', 'checkFanWarnings']);
    warningSpy.checkFieldDataWarnings.and.returnValue({} as FanFieldDataWarnings);
    warningSpy.checkOperationsWarnings.and.returnValue({ costError: null });
    warningSpy.checkMotorWarnings.and.returnValue({} as FanMotorWarnings);
    warningSpy.checkFanWarnings.and.returnValue({ fanSpeedError: null });

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ModifyConditionsTabsComponent],
      providers: [
        { provide: ModifyConditionsService, useValue: jasmine.createSpyObj('ModifyConditionsService', [], { modifyConditionsTab: tabSubject }) },
        { provide: CompareService, useValue: compareSpy },
        { provide: FsatFluidService, useValue: fluidSpy },
        { provide: FanMotorService, useValue: motorSpy },
        { provide: FanFieldDataService, useValue: fieldDataSpy },
        { provide: FanSetupService, useValue: setupSpy },
        { provide: FsatService, useValue: jasmine.createSpyObj('FsatService', [], { updateData: updateDataSubject }) },
        { provide: FsatWarningService, useValue: warningSpy },
        { provide: OperationsService, useValue: operationsSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ModifyConditionsTabsComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    component.settings = { unitsOfMeasure: 'Imperial' } as Settings;
    fixture.detectChanges();
  }

  function mobileItems(): HTMLElement[] {
    return Array.from(host.querySelectorAll('.pagination li.page-item'));
  }

  function setModifiedFsat(fsat: FSAT): void {
    (Object.getOwnPropertyDescriptor(compareSpy, 'modifiedFSAT').get as jasmine.Spy).and.returnValue(fsat);
  }

  describe('initialization', () => {
    it('creates the component', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('reads the current modify conditions tab from the service', () => {
      tabSubject.next('fan-motor');
      createComponent();
      expect(component.modifyConditionsTab).toBe('fan-motor');
    });

    it('starts with all tooltips hidden', () => {
      createComponent();
      expect(component.fanOperationsBadgeHover).toBeFalse();
      expect(component.fanSetupBadgeHover).toBeFalse();
      expect(component.fanMotorBadgeHover).toBeFalse();
      expect(component.fieldDataBadgeHover).toBeFalse();
      expect(component.displayFanOperationsTooltip).toBeFalse();
      expect(component.displayFanSetupTooltip).toBeFalse();
      expect(component.displayFanMotorTooltip).toBeFalse();
      expect(component.displayFieldDataTooltip).toBeFalse();
    });

    it('sets the badge classes from the baseline on startup', () => {
      createComponent();
      expect(component.fanOperationsBadgeClass).toBe('success');
      expect(component.fanSetupBadgeClass).toBe('success');
      expect(component.fanMotorBadgeClass).toBe('success');
      expect(component.fieldDataBadgeClass).toBe('success');
      expect(component.fluidBadgeClass).toBe('success');
    });
  });

  describe('observers', () => {
    it('updates the current tab when the service emits a new tab', () => {
      createComponent();
      tabSubject.next('fan-setup');
      expect(component.modifyConditionsTab).toBe('fan-setup');
    });

    it('recomputes the badge classes when the assessment data updates', () => {
      createComponent();
      expect(component.fanMotorBadgeClass).toBe('success');

      motorSpy.isFanMotorValid.and.returnValue(false);
      updateDataSubject.next(true);

      expect(component.fanMotorBadgeClass).toBe('missing-data');
    });
  });

  describe('template visibility', () => {
    describe('desktop tabs', () => {
      it('renders all four step tabs regardless of the current tab', () => {
        createComponent();
        const tabs = Array.from(host.querySelectorAll('.progress-tabs.d-lg-flex .fixed-tab-size'));
        expect(tabs.map(t => t.querySelector('a').textContent.replace(/\s+/g, ' ').trim())).toEqual(TABS_IN_ORDER.map(t => t.desktopLabel));
      });

      TABS_IN_ORDER.forEach(({ tab }, index) => {
        it(`marks only the ${tab} desktop tab as active when it is the current tab`, () => {
          tabSubject.next(tab);
          createComponent();
          const tabs = Array.from(host.querySelectorAll('.progress-tabs.d-lg-flex .fixed-tab-size'));
          tabs.forEach((el, i) => expect(el.classList.contains('active')).toBe(i === index));
        });
      });
    });

    describe('mobile pager', () => {
      TABS_IN_ORDER.forEach(({ tab, label }) => {
        it(`shows only the ${label} step between the back and continue buttons when the tab is ${tab}`, () => {
          tabSubject.next(tab);
          createComponent();

          const items = mobileItems();
          expect(items.length).toBe(3);
          expect(items[1].textContent.replace(/\s+/g, ' ').trim()).toBe(label);
          expect(items[1].classList).toContain('active');
        });
      });

      it('shows no step item when the current tab is not one of the steps', () => {
        tabSubject.next('some-other-tab');
        createComponent();
        expect(mobileItems().length).toBe(2);
      });

      it('switches the visible step when the tab changes', () => {
        tabSubject.next('fan-operations');
        createComponent();
        expect(mobileItems()[1].textContent).toContain('Operations');

        tabSubject.next('fan-motor');
        fixture.detectChanges();

        expect(mobileItems().length).toBe(3);
        expect(mobileItems()[1].textContent).toContain('Motor');
        expect(mobileItems()[1].textContent).not.toContain('Operations');
      });

      it('disables the back button on the first tab and enables it on later tabs', () => {
        tabSubject.next('fan-operations');
        createComponent();
        expect(mobileItems()[0].classList).toContain('disabled');

        tabSubject.next('fan-setup');
        fixture.detectChanges();
        expect(mobileItems()[0].classList).not.toContain('disabled');
      });

      it('disables the continue button on the last tab and enables it on earlier tabs', () => {
        tabSubject.next('fan-field-data');
        createComponent();
        const items = mobileItems();
        expect(items[items.length - 1].classList).toContain('disabled');

        tabSubject.next('fan-motor');
        fixture.detectChanges();
        const updated = mobileItems();
        expect(updated[updated.length - 1].classList).not.toContain('disabled');
      });
    });

    describe('badge classes', () => {
      it('applies the computed badge class to each desktop badge', () => {
        motorSpy.isFanMotorValid.and.returnValue(false);
        createComponent();
        const badges = Array.from(host.querySelectorAll('.progress-tabs.d-lg-flex .badge'));
        expect(badges.length).toBe(4);
        expect(badges[0].classList).toContain('success');
        expect(badges[1].classList).toContain('success');
        expect(badges[2].classList).toContain('missing-data');
        expect(badges[3].classList).toContain('success');
      });
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    describe('changeModTab', () => {
      TABS_IN_ORDER.forEach(({ tab }) => {
        it(`publishes ${tab} to the modify conditions service`, () => {
          component.changeModTab(tab);
          expect(tabSubject.value).toBe(tab);
        });
      });
    });

    describe('back', () => {
      const transitions: Array<[string, string]> = [
        ['fan-field-data', 'fan-motor'],
        ['fan-motor', 'fan-setup'],
        ['fan-setup', 'fan-operations'],
      ];
      transitions.forEach(([from, to]) => {
        it(`moves from ${from} to ${to}`, () => {
          tabSubject.next(from);
          component.back();
          expect(tabSubject.value).toBe(to);
        });
      });

      it('stays on the first tab', () => {
        tabSubject.next('fan-operations');
        component.back();
        expect(tabSubject.value).toBe('fan-operations');
      });
    });

    describe('continue', () => {
      const transitions: Array<[string, string]> = [
        ['fan-operations', 'fan-setup'],
        ['fan-setup', 'fan-motor'],
        ['fan-motor', 'fan-field-data'],
      ];
      transitions.forEach(([from, to]) => {
        it(`moves from ${from} to ${to}`, () => {
          tabSubject.next(from);
          component.continue();
          expect(tabSubject.value).toBe(to);
        });
      });

      it('stays on the last tab', () => {
        tabSubject.next('fan-field-data');
        component.continue();
        expect(tabSubject.value).toBe('fan-field-data');
      });
    });

    describe('tooltips', () => {
      const badges: Array<{ name: string; hover: TooltipFlagProp; display: TooltipFlagProp }> = [
        { name: 'operations', hover: 'fanOperationsBadgeHover', display: 'displayFanOperationsTooltip' },
        { name: 'fanSetup', hover: 'fanSetupBadgeHover', display: 'displayFanSetupTooltip' },
        { name: 'fanMotor', hover: 'fanMotorBadgeHover', display: 'displayFanMotorTooltip' },
        { name: 'fieldData', hover: 'fieldDataBadgeHover', display: 'displayFieldDataTooltip' },
        { name: 'fsatFluid', hover: 'fluidBadgeHover', display: 'displayFluidTooltip' },
      ];

      badges.forEach(({ name, hover, display }) => {
        it(`reveals the ${name} tooltip after hovering for a second`, fakeAsync(() => {
          component.showTooltip(name);
          expect(component[hover]).toBeTrue();
          expect(component[display]).toBeFalse();

          tick(1000);

          expect(component[display]).toBeTrue();
        }));

        it(`does not reveal the ${name} tooltip when the pointer leaves before a second`, fakeAsync(() => {
          component.showTooltip(name);
          component.hideTooltip(name);

          tick(1000);

          expect(component[hover]).toBeFalse();
          expect(component[display]).toBeFalse();
        }));

        it(`hides the ${name} tooltip when the pointer leaves after it was revealed`, fakeAsync(() => {
          component.showTooltip(name);
          tick(1000);
          component.hideTooltip(name);

          expect(component[hover]).toBeFalse();
          expect(component[display]).toBeFalse();
        }));
      });
    });
  });

  describe('badge class selection', () => {
    interface BadgeCase {
      label: string;
      classProp: BadgeClassProp;
      validSpy: () => jasmine.Spy;
      differentSpy: () => jasmine.Spy;
      warningSpy: () => jasmine.Spy;
      hasWarnings: boolean;
      warningValue: object;
    }

    const cases: BadgeCase[] = [
      { label: 'operations', classProp: 'fanOperationsBadgeClass', validSpy: () => operationsSpy.isOperationsDataValid, differentSpy: () => compareSpy.checkFanOperationsDifferent, warningSpy: () => warningSpy.checkOperationsWarnings, warningValue: { costError: 'bad' }, hasWarnings: true },
      { label: 'fan setup', classProp: 'fanSetupBadgeClass', validSpy: () => setupSpy.isFanSetupValid, differentSpy: () => compareSpy.checkFanSetupDifferent, warningSpy: () => warningSpy.checkFanWarnings, warningValue: { fanSpeedError: 'bad' }, hasWarnings: true },
      { label: 'motor', classProp: 'fanMotorBadgeClass', validSpy: () => motorSpy.isFanMotorValid, differentSpy: () => compareSpy.checkFanMotorDifferent, warningSpy: () => warningSpy.checkMotorWarnings, warningValue: { rpmError: 'bad' }, hasWarnings: true },
      { label: 'field data', classProp: 'fieldDataBadgeClass', validSpy: () => fieldDataSpy.isFanFieldDataValid, differentSpy: () => compareSpy.checkFanFieldDataDifferent, warningSpy: () => warningSpy.checkFieldDataWarnings, warningValue: { voltageError: 'bad' }, hasWarnings: true },
      { label: 'fluid', classProp: 'fluidBadgeClass', validSpy: () => fluidSpy.isFanFluidValid, differentSpy: () => compareSpy.checkFluidDifferent, warningSpy: () => warningSpy.checkMotorWarnings, warningValue: {}, hasWarnings: false },
    ];

    cases.forEach(({ label, classProp, validSpy, differentSpy, warningSpy: warnings, warningValue, hasWarnings }) => {
      describe(label, () => {
        it('is success when the data is valid, has no warnings and is not different', () => {
          setModifiedFsat(makeFsat('mod'));
          createComponent();
          expect(component[classProp]).toBe('success');
        });

        it('is missing-data when the baseline is invalid', () => {
          validSpy().and.returnValue(false);
          createComponent();
          expect(component[classProp]).toBe('missing-data');
        });

        it('is missing-data when the modification is invalid', () => {
          setModifiedFsat(makeFsat('mod'));
          validSpy().and.returnValues(true, false);
          createComponent();
          expect(component[classProp]).toBe('missing-data');
        });

        it('is loss-different when the modification differs from the baseline', () => {
          setModifiedFsat(makeFsat('mod'));
          differentSpy().and.returnValue(true);
          createComponent();
          expect(component[classProp]).toBe('loss-different');
        });

        it('is not loss-different when there is no modification to compare', () => {
          differentSpy().and.returnValue(true);
          createComponent();
          expect(component[classProp]).toBe('success');
        });

        if (hasWarnings) {
          it('is input-error when the baseline has a warning', () => {
            warnings().and.returnValue(warningValue);
            createComponent();
            expect(component[classProp]).toBe('input-error');
          });

          it('is input-error when only the modification has a warning', () => {
            setModifiedFsat(makeFsat('mod'));
            warnings().and.returnValues({}, warningValue);
            createComponent();
            expect(component[classProp]).toBe('input-error');
          });

          it('prefers input-error over loss-different', () => {
            setModifiedFsat(makeFsat('mod'));
            differentSpy().and.returnValue(true);
            warnings().and.returnValue(warningValue);
            createComponent();
            expect(component[classProp]).toBe('input-error');
          });
        }
      });
    });
  });

  describe('destroy', () => {
    it('stops updating the current tab after the component is destroyed', () => {
      createComponent();
      fixture.destroy();
      tabSubject.next('fan-motor');
      expect(component.modifyConditionsTab).toBe('fan-operations');
    });

    it('stops recomputing badge classes after the component is destroyed', () => {
      createComponent();
      const setBadgeClassSpy = spyOn(component, 'setBadgeClass');
      fixture.destroy();
      updateDataSubject.next(true);
      expect(setBadgeClassSpy).not.toHaveBeenCalled();
    });
  });
});
