import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { HelpPanelComponent } from './help-panel.component';
import { HelpPanelService } from './help-panel.service';
import { FsatService } from '../fsat.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const HELP_SELECTORS = [
  'app-system-basics-help',
  'app-fan-operations-help',
  'app-fan-field-data-help',
  'app-fan-motor-help',
  'app-fan-setup-help',
  'app-fsat-fluid-help',
];

function makeFsat(): FSAT {
  return { modifications: [{ fsat: { notes: {} } }] } as FSAT;
}

describe('HelpPanelComponent', () => {
  let component: HelpPanelComponent;
  let fixture: ComponentFixture<HelpPanelComponent>;
  let currentField: BehaviorSubject<string>;
  let stepTab: BehaviorSubject<string>;
  let modifyConditionsTab: BehaviorSubject<string>;
  let globalSettings: Settings;

  function render(options: { inSetup: boolean; tab: string; tabSelect?: string; fsat?: FSAT }): void {
    component.inSetup = options.inSetup;
    component.fsat = options.fsat;
    component.modificationIndex = 0;
    (options.inSetup ? stepTab : modifyConditionsTab).next(options.tab);
    fixture.detectChanges();
    if (options.tabSelect) {
      component.setTab(options.tabSelect);
      fixture.detectChanges();
    }
  }

  function getRenderedHelp(): Array<string> {
    return HELP_SELECTORS.filter(selector => fixture.nativeElement.querySelector(selector) !== null);
  }

  function getTabLabels(): Array<string> {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.panel-tab-item a')).map(a => a.textContent.trim());
  }

  beforeEach(async () => {
    currentField = new BehaviorSubject<string>('default');
    stepTab = new BehaviorSubject<string>('baseline');
    modifyConditionsTab = new BehaviorSubject<string>('fan-field-data');
    globalSettings = {} as Settings;

    await TestBed.configureTestingModule({
      declarations: [HelpPanelComponent],
      providers: [
        { provide: HelpPanelService, useValue: jasmine.createSpyObj('HelpPanelService', [], { currentField }) },
        { provide: FsatService, useValue: jasmine.createSpyObj('FsatService', [], { stepTab }) },
        { provide: ModifyConditionsService, useValue: jasmine.createSpyObj('ModifyConditionsService', [], { modifyConditionsTab }) },
        { provide: SettingsDbService, useValue: { globalSettings } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPanelComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      render({ inSetup: true, tab: 'baseline' });
      expect(component).toBeTruthy();
    });

    it('defaults the selected tab to help', () => {
      render({ inSetup: true, tab: 'baseline' });
      expect(component.tabSelect).toBe('help');
    });

    it('uses the default panel tab from global settings when set', () => {
      globalSettings.defaultPanelTab = 'results';
      render({ inSetup: true, tab: 'baseline' });
      expect(component.tabSelect).toBe('results');
    });

    it('reads currentField from the help panel service', () => {
      render({ inSetup: true, tab: 'baseline' });
      expect(component.currentField).toBe('default');
    });

    it('reads stepTab from the fsat service when in setup', () => {
      stepTab.next('fan-motor');
      modifyConditionsTab.next('fan-setup');
      render({ inSetup: true, tab: 'fan-motor' });
      expect(component.stepTab).toBe('fan-motor');
    });

    it('reads stepTab from the modify conditions service when not in setup', () => {
      stepTab.next('fan-motor');
      render({ inSetup: false, tab: 'fan-setup' });
      expect(component.stepTab).toBe('fan-setup');
    });
  });

  describe('observers', () => {
    it('updates currentField when the help panel service emits', () => {
      render({ inSetup: true, tab: 'baseline' });
      currentField.next('flowRate');
      expect(component.currentField).toBe('flowRate');
    });

    it('updates stepTab when the fsat step tab changes in setup', () => {
      render({ inSetup: true, tab: 'baseline' });
      stepTab.next('fan-motor');
      expect(component.stepTab).toBe('fan-motor');
    });
  });

  describe('user actions', () => {
    it('switches the selected tab when a tab link is clicked', () => {
      render({ inSetup: false, tab: 'fan-field-data' });
      const links = fixture.nativeElement.querySelectorAll('.panel-tab-item a');

      links[0].click();
      fixture.detectChanges();
      expect(component.tabSelect).toBe('results');
      expect(fixture.nativeElement.querySelectorAll('.panel-tab-item.active').length).toBe(1);
      expect(fixture.nativeElement.querySelector('.panel-tab-item.active a').textContent.trim()).toBe('Results');

      links[2].click();
      fixture.detectChanges();
      expect(component.tabSelect).toBe('notes');
      expect(fixture.nativeElement.querySelector('.panel-tab-item.active a').textContent.trim()).toBe('Notes');
    });

    it('emits true on emitSave when save is called', () => {
      render({ inSetup: false, tab: 'fan-field-data' });
      const emitted: Array<boolean> = [];
      component.emitSave.subscribe(value => emitted.push(value));
      component.save();
      expect(emitted).toEqual([true]);
    });
  });

  describe('getContainerHeight', () => {
    it('sets helpHeight to the container height minus the tab bar height', () => {
      component.containerHeight = 1000;
      render({ inSetup: false, tab: 'fan-field-data' });
      component.getContainerHeight();
      expect(component.helpHeight).toBe(1000 - fixture.nativeElement.querySelector('.tabs').parentElement.clientHeight);
    });

    it('leaves helpHeight unset when there is no container height', () => {
      render({ inSetup: false, tab: 'fan-field-data' });
      component.getContainerHeight();
      expect(component.helpHeight).toBeUndefined();
    });
  });

  describe('template visibility', () => {
    describe('tab bar', () => {
      it('shows the tab bar when not in setup', () => {
        render({ inSetup: false, tab: 'fan-motor' });
        expect(fixture.nativeElement.querySelector('.tabs')).not.toBeNull();
      });

      it('shows the tab bar in setup on the fan-field-data tab', () => {
        render({ inSetup: true, tab: 'fan-field-data' });
        expect(fixture.nativeElement.querySelector('.tabs')).not.toBeNull();
      });

      it('shows the tab bar in setup on the fan-setup tab', () => {
        render({ inSetup: true, tab: 'fan-setup' });
        expect(fixture.nativeElement.querySelector('.tabs')).not.toBeNull();
      });

      it('hides the tab bar in setup on any other tab', () => {
        render({ inSetup: true, tab: 'fan-motor' });
        expect(fixture.nativeElement.querySelector('.tabs')).toBeNull();
      });

      it('shows the Results, Help and Notes tabs when not in setup', () => {
        render({ inSetup: false, tab: 'fan-field-data' });
        expect(getTabLabels()).toEqual(['Results', 'Help', 'Notes']);
      });

      it('hides the Notes tab when in setup', () => {
        render({ inSetup: true, tab: 'fan-setup' });
        expect(getTabLabels()).toEqual(['Results', 'Help']);
      });
    });

    describe('help header', () => {
      it('shows the Help header in setup on tabs other than fan-field-data and fan-setup', () => {
        render({ inSetup: true, tab: 'fan-motor' });
        expect(fixture.nativeElement.querySelector('.header h3').textContent).toContain('Help');
      });

      it('hides the Help header in setup on the fan-field-data tab', () => {
        render({ inSetup: true, tab: 'fan-field-data' });
        expect(fixture.nativeElement.querySelector('.header')).toBeNull();
      });

      it('hides the Help header in setup on the fan-setup tab', () => {
        render({ inSetup: true, tab: 'fan-setup' });
        expect(fixture.nativeElement.querySelector('.header')).toBeNull();
      });

      it('hides the Help header when not in setup', () => {
        render({ inSetup: false, tab: 'fan-motor' });
        expect(fixture.nativeElement.querySelector('.header')).toBeNull();
      });
    });

    describe('help content', () => {
      it('shows the system basics help on the baseline step', () => {
        render({ inSetup: false, tab: 'baseline' });
        expect(getRenderedHelp()).toEqual(['app-system-basics-help']);
      });

      it('shows the fan operations help on the fan-operations step', () => {
        render({ inSetup: false, tab: 'fan-operations' });
        expect(getRenderedHelp()).toEqual(['app-fan-operations-help']);
      });

      it('shows the field data help on the fan-field-data step', () => {
        render({ inSetup: false, tab: 'fan-field-data' });
        expect(getRenderedHelp()).toEqual(['app-fan-field-data-help']);
      });

      it('shows the motor help on the fan-motor step', () => {
        render({ inSetup: false, tab: 'fan-motor' });
        expect(getRenderedHelp()).toEqual(['app-fan-motor-help']);
      });

      it('shows the fan setup help and the fluid help on the fan-setup step', () => {
        render({ inSetup: false, tab: 'fan-setup' });
        expect(getRenderedHelp()).toEqual(['app-fan-setup-help', 'app-fsat-fluid-help']);
      });

      it('shows no step help for an unrecognized step', () => {
        render({ inSetup: false, tab: 'some-other-tab' });
        expect(getRenderedHelp()).toEqual([]);
      });

      it('hides the help content when not in setup and a different tab is selected', () => {
        render({ inSetup: false, tab: 'fan-motor', tabSelect: 'results', fsat: makeFsat() });
        expect(getRenderedHelp()).toEqual([]);
      });

      it('shows the help content in setup even when the help tab is not selected', () => {
        render({ inSetup: true, tab: 'fan-motor', tabSelect: 'results' });
        expect(getRenderedHelp()).toEqual(['app-fan-motor-help']);
      });

      it('hides the help content in setup on the fan-field-data step when the help tab is not selected', () => {
        render({ inSetup: true, tab: 'fan-field-data', tabSelect: 'results' });
        expect(getRenderedHelp()).toEqual([]);
      });

      it('hides the fan setup and fluid help in setup when the help tab is not selected', () => {
        render({ inSetup: true, tab: 'fan-setup', tabSelect: 'results' });
        expect(getRenderedHelp()).toEqual([]);
      });
    });

    describe('notes', () => {
      it('hides the notes when the notes tab is not selected', () => {
        render({ inSetup: false, tab: 'baseline', fsat: makeFsat() });
        expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('You must add a modification');
      });

      it('shows the notes component when the notes tab is selected and an fsat exists', () => {
        render({ inSetup: false, tab: 'baseline', tabSelect: 'notes', fsat: makeFsat() });
        expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).not.toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('You must add a modification');
      });

      it('shows the add-a-modification message when the notes tab is selected and no fsat exists', () => {
        render({ inSetup: false, tab: 'baseline', tabSelect: 'notes' });
        expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('You must add a modification to take notes on it.');
      });

      it('hides the notes in setup even when the notes tab is selected', () => {
        render({ inSetup: true, tab: 'fan-motor', tabSelect: 'notes', fsat: makeFsat() });
        expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('You must add a modification');
      });
    });

    describe('results', () => {
      it('hides the results panel when the results tab is not selected', () => {
        render({ inSetup: false, tab: 'baseline' });
        expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
        expect(fixture.nativeElement.querySelector('app-gas-density-results')).toBeNull();
      });

      it('shows the results panel when the results tab is selected outside setup', () => {
        render({ inSetup: false, tab: 'baseline', tabSelect: 'results' });
        expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-gas-density-results')).toBeNull();
      });

      it('shows the results panel in setup on the fan-field-data step when the results tab is selected', () => {
        render({ inSetup: true, tab: 'fan-field-data', tabSelect: 'results' });
        expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).not.toBeNull();
      });

      it('hides the results panel in setup on other steps when the results tab is selected', () => {
        render({ inSetup: true, tab: 'fan-motor', tabSelect: 'results' });
        expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
      });

      it('shows the gas density results instead of the results panel on the fan-setup step', () => {
        render({ inSetup: false, tab: 'fan-setup', tabSelect: 'results' });
        expect(fixture.nativeElement.querySelector('app-gas-density-results')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
      });

      it('shows the gas density results in setup on the fan-setup step', () => {
        render({ inSetup: true, tab: 'fan-setup', tabSelect: 'results' });
        expect(fixture.nativeElement.querySelector('app-gas-density-results')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops updating currentField and stepTab after the component is destroyed', () => {
      render({ inSetup: true, tab: 'baseline' });
      fixture.destroy();
      currentField.next('flowRate');
      stepTab.next('fan-motor');
      expect(component.currentField).toBe('default');
      expect(component.stepTab).toBe('baseline');
    });
  });
});
