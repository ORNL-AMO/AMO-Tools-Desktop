import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';
import { BaselineView } from '../../models/views';
import { BaselineTabsComponent } from './baseline-tabs.component';

describe('BaselineTabsComponent', () => {
  let fixture: ComponentFixture<BaselineTabsComponent>;
  let uiService: jasmine.SpyObj<ProcessHeatingUiService>;
  let tabNavHelper: jasmine.SpyObj<TabNavHelper>;
  const canContinue = signal(true);
  const canGoBack = signal(true);

  const backControl = (): HTMLElement => fixture.nativeElement.querySelector('.pagination > li:first-child');
  const continueControl = (): HTMLElement => fixture.nativeElement.querySelector('.pagination > li:last-child');

  beforeEach(() => {
    canContinue.set(true);
    canGoBack.set(true);
    uiService = jasmine.createSpyObj('ProcessHeatingUiService', ['continue', 'back'], {
      childView: signal(''),
      canContinue,
      canGoBack,
    });

    tabNavHelper = jasmine.createSpyObj('TabNavHelper', ['isLinkDisabled', 'isTabInvalid', 'invalidTabLabel', 'handleCanNavigate']);
    tabNavHelper.invalidTabLabel.and.callFake(link => tabNavHelper.isTabInvalid(link) ? `${link.label}, has invalid inputs` : null);
    TestBed.configureTestingModule({
      declarations: [BaselineTabsComponent],
      providers: [
        { provide: ProcessHeatingUiService, useValue: uiService },
        { provide: TabNavHelper, useValue: tabNavHelper },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(BaselineTabsComponent);
  });

  it('marks only the tabs with invalid inputs', () => {
    tabNavHelper.isTabInvalid.and.callFake(link => link.view === BaselineView.ASSESSMENT_SETTINGS);
    fixture.detectChanges();

    const invalidTabs = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ul.d-lg-block > li.missing-data'));
    expect(invalidTabs.map(tab => tab.textContent.trim())).toEqual(['1 Assessment Settings']);
  });

  it('gives only the invalid tabs an accessible name and tooltip stating why they are marked', () => {
    tabNavHelper.isTabInvalid.and.callFake(link => link.view === BaselineView.ASSESSMENT_SETTINGS);
    fixture.detectChanges();

    const links = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ul.d-lg-block > li > a'));
    expect(links[0].getAttribute('aria-label')).toBe('Assessment Settings, has invalid inputs');
    expect(links[0].getAttribute('title')).toBe('Assessment Settings, has invalid inputs');
    expect(links[1].hasAttribute('aria-label')).toBeFalse();
    expect(links[1].hasAttribute('title')).toBeFalse();
  });

  describe('small screen step controls', () => {
    it('keeps Back enabled when Continue is blocked by invalid inputs', () => {
      canContinue.set(false);
      fixture.detectChanges();

      expect(backControl().classList).not.toContain('disabled');
      expect(continueControl().classList).toContain('disabled');
    });

    it('disables Back when there is no previous step', () => {
      canGoBack.set(false);
      fixture.detectChanges();

      expect(backControl().classList).toContain('disabled');
      expect(continueControl().classList).not.toContain('disabled');
    });
  });
});
