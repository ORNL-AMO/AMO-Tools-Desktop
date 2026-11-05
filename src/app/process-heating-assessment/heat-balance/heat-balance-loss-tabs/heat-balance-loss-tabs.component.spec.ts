import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LossView, ViewLink } from '../../models/views';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';
import { HeatBalanceLossTabsComponent } from './heat-balance-loss-tabs.component';

describe('HeatBalanceLossTabsComponent', () => {
  let fixture: ComponentFixture<HeatBalanceLossTabsComponent>;
  let tabNavHelper: jasmine.SpyObj<TabNavHelper>;
  let uiService: jasmine.SpyObj<ProcessHeatingUiService>;
  const tabs: ViewLink[] = [
    { view: LossView.OPERATIONS, label: 'Operations' },
    { view: LossView.FLUE_GAS, label: 'Flue Gas' },
    { view: LossView.WALL_LOSSES, label: 'Wall Losses' },
  ];

  const badgedTabs = (): string[] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ul.d-lg-block > li'))
      .filter(tab => tab.querySelector('.badge.missing-data'))
      .map(tab => tab.textContent.trim());

  const badges = (): { label: string; badge: string; isValid: boolean }[] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ul.d-lg-block > li .badge'))
      .map(badge => ({
        label: badge.closest('a').firstChild.textContent.trim(),
        badge: badge.textContent.trim(),
        isValid: badge.classList.contains('success'),
      }));

  beforeEach(() => {
    tabNavHelper = jasmine.createSpyObj('TabNavHelper', ['isLinkDisabled', 'isTabInvalid', 'invalidTabLabel', 'handleCanNavigate']);
    tabNavHelper.invalidTabLabel.and.callFake(link => tabNavHelper.isTabInvalid(link) ? `${link.label}, has invalid inputs` : null);
    uiService = jasmine.createSpyObj('ProcessHeatingUiService', ['continue', 'back', 'lossCount'], {
      visibleHeatBalanceTabs: signal(tabs),
      lossSubView: signal(''),
      canContinue: signal(true),
      canGoBack: signal(true),
    });
    TestBed.configureTestingModule({
      declarations: [HeatBalanceLossTabsComponent],
      providers: [
        { provide: ProcessHeatingUiService, useValue: uiService },
        { provide: TabNavHelper, useValue: tabNavHelper },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(HeatBalanceLossTabsComponent);
  });

  it('shows no error badge when every tab is valid', () => {
    fixture.detectChanges();

    expect(badgedTabs()).toEqual([]);
  });

  it('shows an error badge only on the tabs with invalid inputs', () => {
    tabNavHelper.isTabInvalid.and.callFake(link => link.view === LossView.FLUE_GAS);
    fixture.detectChanges();

    expect(badgedTabs()).toEqual(['Flue Gas']);
  });

  it('gives only the invalid tabs an accessible name and tooltip stating why they are marked', () => {
    tabNavHelper.isTabInvalid.and.callFake(link => link.view === LossView.FLUE_GAS);
    uiService.lossCount.and.returnValue(2);
    fixture.detectChanges();

    const links = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ul.d-lg-block > li > a'));
    expect(links[1].getAttribute('aria-label')).toBe('Flue Gas, has invalid inputs');
    expect(links[1].getAttribute('title')).toBe('Flue Gas, has invalid inputs');
    expect(links[0].hasAttribute('aria-label')).toBeFalse();
  });

  it('shows each tab\'s entry count, green while its inputs are valid', () => {
    uiService.lossCount.and.callFake(view => ({ [LossView.FLUE_GAS]: 1, [LossView.WALL_LOSSES]: 3 })[view]);
    fixture.detectChanges();

    expect(badges()).toEqual([
      { label: 'Flue Gas', badge: '1', isValid: true },
      { label: 'Wall Losses', badge: '3', isValid: true },
    ]);
  });

  it('turns a tab\'s count red when its inputs are invalid', () => {
    uiService.lossCount.and.returnValue(2);
    tabNavHelper.isTabInvalid.and.callFake(link => link.view === LossView.WALL_LOSSES);
    fixture.detectChanges();

    expect(badges().find(badge => badge.label === 'Wall Losses')).toEqual({ label: 'Wall Losses', badge: '2', isValid: false });
  });

  it('hides the badge for a valid tab with no entries', () => {
    uiService.lossCount.and.callFake(view => view === LossView.OPERATIONS ? undefined : 0);
    fixture.detectChanges();

    expect(badges()).toEqual([]);
  });
});
