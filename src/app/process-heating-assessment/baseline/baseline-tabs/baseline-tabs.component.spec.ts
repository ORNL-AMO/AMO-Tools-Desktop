import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';
import { BaselineTabsComponent } from './baseline-tabs.component';

describe('BaselineTabsComponent', () => {
  let fixture: ComponentFixture<BaselineTabsComponent>;
  let uiService: jasmine.SpyObj<ProcessHeatingUiService>;
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

    TestBed.configureTestingModule({
      declarations: [BaselineTabsComponent],
      providers: [
        { provide: ProcessHeatingUiService, useValue: uiService },
        { provide: TabNavHelper, useValue: jasmine.createSpyObj('TabNavHelper', ['isLinkDisabled', 'handleCanNavigate']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(BaselineTabsComponent);
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
