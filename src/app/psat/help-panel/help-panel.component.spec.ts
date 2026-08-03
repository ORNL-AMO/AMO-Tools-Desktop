import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HelpPanelComponent } from './help-panel.component';
import { PsatService } from '../psat.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatTabService } from '../psat-tab.service';

describe('HelpPanelComponent', () => {
  let component: HelpPanelComponent;
  let fixture: ComponentFixture<HelpPanelComponent>;

  const mockPsat: any = { inputs: {}, modifications: [] };
  const mockSettings: any = { unitsOfMeasure: 'Imperial' };

  beforeEach(async () => {
    const psatServiceSpy = jasmine.createSpyObj('PsatService', ['getPsatResults', 'isPsatValid'], {
      getResults: new BehaviorSubject<boolean>(false),
    });
    psatServiceSpy.getPsatResults.and.returnValue({
      baselineResults: {},
      modificationResults: null,
      annualSavings: 0,
      percentSavings: 0,
    });
    psatServiceSpy.isPsatValid.and.returnValue({ isValid: true });

    const settingsDbServiceSpy = { globalSettings: null };

    const psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], {
      modifyConditionsTab: new BehaviorSubject<string>('pump-fluid'),
    });

    await TestBed.configureTestingModule({
      declarations: [HelpPanelComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPanelComponent);
    component = fixture.componentInstance;
    component.psat = mockPsat;
    component.settings = mockSettings;
    component.inSetup = false;
    component.showResults = false;
    component.currentTab = 'pump-fluid';
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('help panel visibility based on inSetup', () => {
    it('shows result tabs when inSetup is false', () => {
      component.inSetup = false;
      fixture.detectChanges();
      const tabsDiv = fixture.nativeElement.querySelector('.d-flex.flex-wrap.tabs.primary');
      expect(tabsDiv).not.toBeNull();
    });

    it('shows result tabs when showResults is true even if inSetup is true', () => {
      component.inSetup = true;
      component.showResults = true;
      fixture.detectChanges();
      const tabsDiv = fixture.nativeElement.querySelector('.d-flex.flex-wrap.tabs.primary');
      expect(tabsDiv).not.toBeNull();
    });

    it('hides result tabs when inSetup is true and showResults is false', () => {
      component.inSetup = true;
      component.showResults = false;
      fixture.detectChanges();
      const tabsDiv = fixture.nativeElement.querySelector('.d-flex.flex-wrap.tabs.primary');
      expect(tabsDiv).toBeNull();
    });
  });

  describe('Notes tab visibility', () => {
    it('shows Notes tab when inSetup is false', () => {
      component.inSetup = false;
      fixture.detectChanges();
      const tabs = fixture.nativeElement.querySelectorAll('.panel-tab-item');
      const labels = Array.from(tabs).map((t: any) => t.textContent.trim());
      expect(labels.some(l => l.includes('Notes'))).toBeTrue();
    });

    it('hides Notes tab when inSetup is true', () => {
      component.inSetup = true;
      component.showResults = true;
      fixture.detectChanges();
      const tabs = fixture.nativeElement.querySelectorAll('.panel-tab-item');
      const labels = Array.from(tabs).map((t: any) => t.textContent.trim());
      expect(labels.some(l => l.includes('Notes'))).toBeFalse();
    });
  });

  describe('help content by currentTab', () => {
    beforeEach(() => {
      component.inSetup = false;
      component.tabSelect = 'help';
    });

    it('shows pump-operations-help when currentTab is "operations"', () => {
      component.currentTab = 'operations';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-pump-operations-help')).not.toBeNull();
    });

    it('shows system-basics-help when currentTab is "baseline"', () => {
      component.currentTab = 'baseline';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-system-basics-help')).not.toBeNull();
    });

    it('shows pump-fluid-help when currentTab is "pump-fluid"', () => {
      component.currentTab = 'pump-fluid';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-pump-fluid-help')).not.toBeNull();
    });

    it('shows motor-help when currentTab is "motor"', () => {
      component.currentTab = 'motor';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-motor-help')).not.toBeNull();
    });

    it('shows field-data-help when currentTab is "field-data"', () => {
      component.currentTab = 'field-data';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-field-data-help')).not.toBeNull();
    });
  });

  describe('notes panel', () => {
    beforeEach(() => {
      component.inSetup = false;
      component.tabSelect = 'notes';
    });

    it('shows modify-conditions-notes when modification exists', () => {
      component.modification = { notes: {} } as any;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).not.toBeNull();
    });

    it('shows message when no modification exists', () => {
      component.modification = undefined;
      fixture.detectChanges();
      const msg = fixture.nativeElement.querySelector('.col-11.p-4');
      expect(msg).not.toBeNull();
    });
  });
});
