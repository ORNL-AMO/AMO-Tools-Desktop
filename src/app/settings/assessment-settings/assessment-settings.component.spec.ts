import { TestBed } from '@angular/core/testing';
import { Injector, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { AssessmentSettingsComponent } from './assessment-settings.component';
import { ResetDataModalComponent, ResetDataResult } from './reset-data-modal/reset-data-modal.component';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../settings.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { Settings } from '../../shared/models/settings';

describe('AssessmentSettingsComponent: Restore System Settings', () => {
  let component: AssessmentSettingsComponent;
  let modalDialogService: jasmine.SpyObj<ModalDialogService>;
  let dashboardService: { updateDashboardData: Subject<boolean> };
  let settingsDbService: { globalSettings: Settings };
  let dialogClosed: Subject<ResetDataResult | undefined>;

  beforeEach(() => {
    dialogClosed = new Subject<ResetDataResult | undefined>();
    modalDialogService = jasmine.createSpyObj<ModalDialogService>('ModalDialogService', ['openModal']);
    modalDialogService.openModal.and.returnValue({ closed: dialogClosed } as unknown as DialogRef<unknown, unknown>);
    dashboardService = { updateDashboardData: new Subject<boolean>() };
    settingsDbService = { globalSettings: { unitsOfMeasure: 'Metric' } as Settings };

    TestBed.configureTestingModule({
      declarations: [AssessmentSettingsComponent],
      providers: [
        { provide: ModalDialogService, useValue: modalDialogService },
        { provide: DashboardService, useValue: dashboardService },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: SettingsService, useValue: { getFormFromSettings: (settings: Settings) => ({ settings }) } },
        { provide: FeatureFlagService, useValue: { showOperationalImpacts: signal(false) } },
      ],
    })
      // The page's template pulls in every settings section; only the button handler is under test here.
      .overrideTemplate(AssessmentSettingsComponent, '');
    component = TestBed.createComponent(AssessmentSettingsComponent).componentInstance;
    component.ngOnInit();
  });

  it('opens the reset modal through the dialog service, blocking outside clicks and Escape', () => {
    component.showResetSystemSettingsModal();

    // Component injectors are NodeInjectors, not Injector instances; the next test checks the injector actually resolves services.
    expect(modalDialogService.openModal).toHaveBeenCalledOnceWith(ResetDataModalComponent, jasmine.objectContaining({ disableClose: true }), jasmine.anything());
  });

  it('uses the panel class that makes the dialog full screen on small views', () => {
    component.showResetSystemSettingsModal();

    expect(modalDialogService.openModal.calls.mostRecent().args[1].panelClass).toEqual(['app-modal-dialog', 'reset-data-modal-dialog']);
  });

  it('passes an injector that can reach the page\'s module-level services', () => {
    component.showResetSystemSettingsModal();

    const injector: Injector = modalDialogService.openModal.calls.mostRecent().args[2];
    expect(injector.get(DashboardService)).toBe(dashboardService as unknown as DashboardService);
  });

  it('reloads its settings and the dashboard after a reset changed data', () => {
    let dashboardUpdates: number = 0;
    dashboardService.updateDashboardData.subscribe(() => dashboardUpdates++);
    component.showResetSystemSettingsModal();
    settingsDbService.globalSettings = { unitsOfMeasure: 'Imperial' } as Settings;

    dialogClosed.next({ dataChanged: true });

    expect(component.settings.unitsOfMeasure).toBe('Imperial');
    expect(dashboardUpdates).toBe(1);
  });

  it('leaves the page alone when the modal closed without resetting', () => {
    let dashboardUpdates: number = 0;
    dashboardService.updateDashboardData.subscribe(() => dashboardUpdates++);
    component.showResetSystemSettingsModal();
    settingsDbService.globalSettings = { unitsOfMeasure: 'Imperial' } as Settings;

    dialogClosed.next({ dataChanged: false });

    expect(component.settings.unitsOfMeasure).toBe('Metric');
    expect(dashboardUpdates).toBe(0);
  });
});
