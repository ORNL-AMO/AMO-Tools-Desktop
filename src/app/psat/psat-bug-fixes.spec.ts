import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';
import { ModificationListComponent } from './modification-list/modification-list.component';
import { PsatTabsComponent } from './psat-tabs/psat-tabs.component';
import { PsatComponent } from './psat.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities/explore-opportunities-help/explore-opportunities-help.component';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PsatWarningService } from './psat-warning.service';

describe('PSAT bug fixes', () => {
  describe('ModificationListComponent.addNewModification', () => {
    function buildComponent() {
      const getResults = new BehaviorSubject<boolean>(false);
      const compareService = {
        setCompareVals: jasmine.createSpy('setCompareVals')
      };
      const psatService = {
        getResults,
        resultsExisting: jasmine.createSpy('resultsExisting').and.returnValue({ pump_efficiency: 87 })
      };
      const psatTabService = {
        secondaryTab: new BehaviorSubject<string>('explore-opportunities')
      };

      const component = new ModificationListComponent(compareService as any, psatService as any, psatTabService as any);
      component.settings = {} as any;
      component.dropdown = [];
      component.rename = [];
      component.deleteArr = [];
      return component;
    }

    it('does not append a numeric suffix when creating the first copy of a scenario name', () => {
      const component = buildComponent();
      const sourcePsat = { name: 'Scenario 1', inputs: { co2SavingsData: { userEnteredBaselineEmissions: 4 } } } as any;
      component.psat = {
        inputs: {},
        modifications: [
          { psat: sourcePsat, id: 'mod-1', notes: { fieldDataNotes: '', motorNotes: '', pumpFluidNotes: '', systemBasicsNotes: '' } }
        ]
      } as any;

      component.addNewModification(sourcePsat);

      expect(component.psat.modifications[1].psat.name).toBe('Scenario 1');
    });

    it('appends a numeric suffix when copies of a scenario name already exist', () => {
      const component = buildComponent();
      const sourcePsat = { name: 'Scenario 1', inputs: { co2SavingsData: { userEnteredBaselineEmissions: 4 } } } as any;
      component.psat = {
        inputs: {},
        modifications: [
          { psat: sourcePsat, id: 'mod-1', notes: { fieldDataNotes: '', motorNotes: '', pumpFluidNotes: '', systemBasicsNotes: '' } },
          { psat: { name: 'Scenario 1(1)', inputs: { co2SavingsData: { userEnteredBaselineEmissions: 4 } } }, id: 'mod-2', notes: { fieldDataNotes: '', motorNotes: '', pumpFluidNotes: '', systemBasicsNotes: '' } }
        ]
      } as any;

      component.addNewModification(sourcePsat);

      expect(component.psat.modifications[2].psat.name).toBe('Scenario 1(2)');
    });
  });

  describe('PsatTabsComponent', () => {
    it('unsubscribes getResultsSub and stepTabSub in ngOnDestroy', () => {
      const fakeComponent: any = {
        secondarySub: { unsubscribe: jasmine.createSpy('secondarySub') },
        calcSub: { unsubscribe: jasmine.createSpy('calcSub') },
        mainSub: { unsubscribe: jasmine.createSpy('mainSub') },
        modSubscription: { unsubscribe: jasmine.createSpy('modSubscription') },
        getResultsSub: { unsubscribe: jasmine.createSpy('getResultsSub') },
        stepTabSub: { unsubscribe: jasmine.createSpy('stepTabSub') }
      };

      PsatTabsComponent.prototype.ngOnDestroy.call(fakeComponent);

      expect(fakeComponent.getResultsSub.unsubscribe).toHaveBeenCalled();
      expect(fakeComponent.stepTabSub.unsubscribe).toHaveBeenCalled();
    });

    it('passes isModification=true to checkMotorWarnings when modifications are present', () => {
      const psatWarningService = {
        checkMotorWarnings: jasmine.createSpy('checkMotorWarnings').and.returnValue({}),
        checkWarningsExist: jasmine.createSpy('checkWarningsExist').and.returnValue(false)
      };
      const component = new PsatTabsComponent(
        {} as any,
        psatWarningService as any,
        {} as any,
        {} as any,
        { detectChanges: () => {} } as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any
      );
      component.psat = { inputs: {}, modifications: [] } as any;
      component.settings = {} as any;
      spyOn(component, 'checkPumpFluidInvalid').and.returnValue(false);
      spyOn(component, 'checkMotorInvalid').and.returnValue(false);

      component.checkMotorStatus();

      expect(psatWarningService.checkMotorWarnings).toHaveBeenCalledWith(component.psat, component.settings, true);
    });
  });

  describe('PsatComponent', () => {
    it('unsubscribes modalOpenSub in ngOnDestroy', () => {
      const fakeComponent: any = {
        compareService: {
          baselinePSAT: {},
          modifiedPSAT: {},
          selectedModification: { next: jasmine.createSpy('selectedModification.next') }
        },
        addNewSub: { unsubscribe: jasmine.createSpy('addNewSub') },
        openModSub: { unsubscribe: jasmine.createSpy('openModSub') },
        selectedModSubscription: { unsubscribe: jasmine.createSpy('selectedModSubscription') },
        calcTabSub: { unsubscribe: jasmine.createSpy('calcTabSub') },
        secondaryTabSub: { unsubscribe: jasmine.createSpy('secondaryTabSub') },
        mainTabSub: { unsubscribe: jasmine.createSpy('mainTabSub') },
        stepTabSubscription: { unsubscribe: jasmine.createSpy('stepTabSubscription') },
        showExportModalSub: { unsubscribe: jasmine.createSpy('showExportModalSub') },
        modalOpenSub: { unsubscribe: jasmine.createSpy('modalOpenSub') },
        connectedInventoryDataSub: { unsubscribe: jasmine.createSpy('connectedInventoryDataSub') },
        psatTabService: {
          secondaryTab: { next: jasmine.createSpy('secondaryTab.next') },
          mainTab: { next: jasmine.createSpy('mainTab.next') },
          stepTab: { next: jasmine.createSpy('stepTab.next') },
          modifyConditionsTab: { next: jasmine.createSpy('modifyConditionsTab.next') }
        },
        integrationStateService: {
          connectedInventoryData: { next: jasmine.createSpy('connectedInventoryData.next') },
          getEmptyConnectedInventoryData: jasmine.createSpy('getEmptyConnectedInventoryData').and.returnValue({})
        }
      };

      PsatComponent.prototype.ngOnDestroy.call(fakeComponent);

      expect(fakeComponent.modalOpenSub.unsubscribe).toHaveBeenCalled();
    });

    it('provides bound handlers used by psat.component.html outputs', () => {
      const fakeComponent: any = {
        isModalOpen: false,
        psatService: { modalOpen: { next: jasmine.createSpy('modalOpen.next') } },
        psatTabService: { mainTab: { next: jasmine.createSpy('mainTab.next') } }
      };

      PsatComponent.prototype.toggleOpenPanel.call(fakeComponent, true);
      PsatComponent.prototype.modalOpen.call(fakeComponent);
      PsatComponent.prototype.modalClose.call(fakeComponent);
      PsatComponent.prototype.closeReport.call(fakeComponent);

      expect(fakeComponent.isModalOpen).toBeTrue();
      expect(fakeComponent.psatService.modalOpen.next).toHaveBeenCalledWith(true);
      expect(fakeComponent.psatService.modalOpen.next).toHaveBeenCalledWith(false);
      expect(fakeComponent.psatTabService.mainTab.next).toHaveBeenCalledWith('assessment');
    });
  });

  describe('SystemBasicsComponent', () => {
    it('does not throw when show/hide settings modal is called without a resolved ViewChild', () => {
      const component = new SystemBasicsComponent({} as any, {} as any, {} as any);
      spyOn(component.openModal, 'emit');
      spyOn(component.closeModal, 'emit');

      expect(() => component.showSettingsModal()).not.toThrow();
      expect(() => component.hideSettingsModal()).not.toThrow();
      expect(component.openModal.emit).toHaveBeenCalledWith(true);
      expect(component.closeModal.emit).toHaveBeenCalledWith(true);
    });
  });
});

describe('ExploreOpportunitiesHelpComponent template guard', () => {
  let fixture: ComponentFixture<ExploreOpportunitiesHelpComponent>;
  let component: ExploreOpportunitiesHelpComponent;

  beforeEach(async () => {
    const convertUnitsService = {
      value: jasmine.createSpy('value').and.returnValue({
        from: () => ({ to: () => 1 })
      })
    };

    const psatWarningService = {
      getFlowRateMinMax: jasmine.createSpy('getFlowRateMinMax').and.returnValue({ min: 1, max: 10 })
    };

    await TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesHelpComponent],
      providers: [
        { provide: ConvertUnitsService, useValue: convertUnitsService },
        { provide: PsatWarningService, useValue: psatWarningService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesHelpComponent);
    component = fixture.componentInstance;
    component.settings = { flowMeasurement: 'gpm' } as any;
    component.currentField = '';
  });

  it('renders without throwing when psat.modifications is undefined', () => {
    component.psat = { inputs: { pump_style: 0 }, modifications: undefined } as any;
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('renders without throwing when psat.modifications is null', () => {
    component.psat = { inputs: { pump_style: 0 }, modifications: null } as any;
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
