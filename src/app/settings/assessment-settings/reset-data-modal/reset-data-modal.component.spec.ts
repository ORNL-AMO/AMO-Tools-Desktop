import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ResetDataModalComponent } from './reset-data-modal.component';
import { ResetDataService } from './reset-data.service';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { ElectronService } from '../../../electron/electron.service';
import { AppErrorService } from '../../../shared/errors/app-error.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { AnimatedCheckmarkModule } from '../../../shared/animated-checkmark/animated-checkmark.module';

/** Option keys the template passes to toggleResetSystemSettingsOption. */
type ResetOption = 'app-settings' | 'example-items' | 'user-assessments' | 'custom-materials';
type ResetStep = 'restoreExampleItems' | 'deleteUserItems' | 'deleteCustomMaterials' | 'restoreDefaultAppSettings' | 'refreshCaches';

const STEP_FOR_OPTION: Record<ResetOption, ResetStep> = {
  'example-items': 'restoreExampleItems',
  'user-assessments': 'deleteUserItems',
  'custom-materials': 'deleteCustomMaterials',
  'app-settings': 'restoreDefaultAppSettings',
};
const STEP_ORDER: Array<ResetStep> = ['restoreExampleItems', 'deleteUserItems', 'deleteCustomMaterials', 'restoreDefaultAppSettings'];
const SERVICE_METHODS: Array<ResetStep> = [...STEP_ORDER, 'refreshCaches'];

/** The combinations QA listed on issue 8965. */
const ISSUE_COMBINATIONS: Array<Array<ResetOption>> = [
  ['app-settings', 'example-items'],
  ['app-settings', 'user-assessments'],
  ['app-settings', 'custom-materials'],
  ['app-settings', 'example-items', 'user-assessments'],
  ['app-settings', 'user-assessments', 'custom-materials'],
  ['app-settings', 'example-items', 'user-assessments', 'custom-materials'],
  ['example-items', 'user-assessments'],
  ['example-items', 'custom-materials'],
  ['example-items', 'user-assessments', 'custom-materials'],
  ['user-assessments', 'custom-materials'],
];

describe('ResetDataModalComponent', () => {
  let fixture: ComponentFixture<ResetDataModalComponent>;
  let component: ResetDataModalComponent;
  let resetDataService: jasmine.SpyObj<ResetDataService>;
  let appErrorService: jasmine.SpyObj<AppErrorService>;
  let stepsRun: Array<ResetStep>;

  const select = (...options: Array<ResetOption | 'reset-all'>) => options.forEach(option => component.toggleResetSystemSettingsOption(option));
  const acceptButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('.modal-footer .btn-danger');

  beforeEach(async () => {
    stepsRun = [];
    resetDataService = jasmine.createSpyObj<ResetDataService>('ResetDataService', SERVICE_METHODS);
    SERVICE_METHODS.forEach(step => resetDataService[step].and.callFake(async () => { stepsRun.push(step); }));
    appErrorService = jasmine.createSpyObj<AppErrorService>('AppErrorService', ['handleAppError', 'handleObservableAppError']);
    appErrorService.handleAppError.and.callFake((message: string) => { throw new Error(message); });

    await TestBed.configureTestingModule({
      declarations: [ResetDataModalComponent],
      imports: [ModalModule.forRoot(), AnimatedCheckmarkModule],
      providers: [
        { provide: AppErrorService, useValue: appErrorService },
        { provide: DashboardService, useValue: { updateDashboardData: new Subject<boolean>() } },
        { provide: ElectronService, useValue: { isElectron: false } },
        { provide: NgxIndexedDBService, useValue: {} },
        { provide: FeatureFlagService, useValue: jasmine.createSpyObj<FeatureFlagService>('FeatureFlagService', ['restoreUserFlagsToDefault']) },
      ],
    })
      // The modal provides its own ResetDataService, so the fake must replace the component-level provider.
      .overrideComponent(ResetDataModalComponent, { set: { providers: [{ provide: ResetDataService, useValue: resetDataService }] } })
      .compileComponents();

    fixture = TestBed.createComponent(ResetDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(component.closeModal, 'emit');
    // resetAllData deletes the database and reloads the page; never run it in a test.
    spyOn(component, 'resetAllData');
  });

  ISSUE_COMBINATIONS.forEach(options => {
    it(`runs every selected option: ${options.join(' + ')}`, async () => {
      select(...options);

      await component.resetSystemSettingsAccept();

      const expectedSteps: Array<ResetStep> = STEP_ORDER.filter(step => options.some(option => STEP_FOR_OPTION[option] === step));
      expect(stepsRun).withContext('selected steps in order, then one cache refresh').toEqual([...expectedSteps, 'refreshCaches']);
      expect(component.resetAllData).not.toHaveBeenCalled();
      expect(component.closeModal.emit).toHaveBeenCalledTimes(1);
      expect(component.deleting).withContext('spinner stays up while the modal closes').toBeTrue();
    });
  });

  it('Reset All deletes the whole database instead of running individual steps', async () => {
    select('reset-all');

    await component.resetSystemSettingsAccept();

    expect(component.resetAllData).toHaveBeenCalledTimes(1);
    expect(stepsRun).toEqual([]);
  });

  it('turns Reset All off when the user unchecks one option, so the database is not wiped', async () => {
    select('reset-all', 'user-assessments');

    expect(component.resetAll).toBeFalse();
    await component.resetSystemSettingsAccept();

    expect(component.resetAllData).not.toHaveBeenCalled();
    expect(stepsRun).toEqual(['restoreExampleItems', 'deleteCustomMaterials', 'restoreDefaultAppSettings', 'refreshCaches']);
  });

  it('keeps Reset All off when the user checks all four options one by one, so only those four steps run', () => {
    select('app-settings', 'example-items', 'user-assessments', 'custom-materials');

    expect(component.resetAll).toBeFalse();
  });

  it('stops at the first failing step, reports the error and closes the modal', async () => {
    resetDataService.restoreExampleItems.and.rejectWith(new Error('Example items could not be loaded.'));
    select('example-items', 'user-assessments', 'app-settings');

    await expectAsync(component.resetSystemSettingsAccept()).toBeRejectedWithError('Error restoring system settings');

    expect(appErrorService.handleAppError).toHaveBeenCalledWith('Error restoring system settings', jasmine.any(Error));
    expect(resetDataService.deleteUserItems).not.toHaveBeenCalled();
    expect(resetDataService.restoreDefaultAppSettings).not.toHaveBeenCalled();
    expect(resetDataService.refreshCaches).withContext('earlier steps may have changed data').toHaveBeenCalledTimes(1);
    expect(component.closeModal.emit).toHaveBeenCalledTimes(1);
    expect(component.deleting).toBeFalse();
  });

  it('disables Accept until an option is selected', () => {
    expect(acceptButton().disabled).toBeTrue();

    select('custom-materials');
    fixture.detectChanges();

    expect(acceptButton().disabled).toBeFalse();
  });

  it('Cancel closes the modal without resetting anything', () => {
    select('example-items', 'user-assessments');

    fixture.nativeElement.querySelector('.modal-footer .btn-secondary').click();

    expect(stepsRun).toEqual([]);
    expect(component.resetAllData).not.toHaveBeenCalled();
    expect(component.closeModal.emit).toHaveBeenCalledTimes(1);
  });
});
