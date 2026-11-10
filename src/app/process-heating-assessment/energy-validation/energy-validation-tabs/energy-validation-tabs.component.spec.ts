import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnergyValidationView } from '../../models/views';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';
import { EnergyValidationTabsComponent } from './energy-validation-tabs.component';

describe('EnergyValidationTabsComponent', () => {
  let fixture: ComponentFixture<EnergyValidationTabsComponent>;
  let uiService: jasmine.SpyObj<ProcessHeatingUiService>;
  let tabNavHelper: jasmine.SpyObj<TabNavHelper>;

  const largeTabs = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('ul.d-lg-block > li'));

  beforeEach(() => {
    uiService = jasmine.createSpyObj('ProcessHeatingUiService', ['continue', 'back'], {
      canContinue: signal(true),
      canGoBack: signal(true),
    });
    tabNavHelper = jasmine.createSpyObj('TabNavHelper', ['isTabInvalid', 'invalidTabLabel']);
    tabNavHelper.invalidTabLabel.and.callFake(link => tabNavHelper.isTabInvalid(link) ? `${link.label}, has invalid inputs` : null);
    TestBed.configureTestingModule({
      declarations: [EnergyValidationTabsComponent],
      providers: [
        { provide: ProcessHeatingUiService, useValue: uiService },
        { provide: TabNavHelper, useValue: tabNavHelper },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(EnergyValidationTabsComponent);
  });

  it('lists Designed Energy before Metered Energy', () => {
    fixture.detectChanges();

    expect(largeTabs().map(tab => tab.textContent.trim())).toEqual(['Designed Energy', 'Metered Energy']);
  });

  it('marks only the sub-tab with invalid inputs and names why', () => {
    tabNavHelper.isTabInvalid.and.callFake(link => link.view === EnergyValidationView.DESIGNED_ENERGY);
    fixture.detectChanges();

    const [designed, metered] = largeTabs();
    expect(metered.classList).not.toContain('missing-data');
    expect(designed.classList).toContain('missing-data');
    expect(designed.querySelector('a').getAttribute('title')).toBe('Designed Energy, has invalid inputs');
  });

  it('steps forward and back from the small screen controls', () => {
    fixture.detectChanges();
    const controls = fixture.nativeElement.querySelectorAll('.pagination > li > a');

    controls[0].click();
    controls[controls.length - 1].click();

    expect(uiService.back).toHaveBeenCalled();
    expect(uiService.continue).toHaveBeenCalled();
  });
});
