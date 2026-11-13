import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RESET_STEPS, RESET_SUCCESS_CLOSE_DELAY_MS, ResetDataModalComponent, ResetOption } from './reset-data-modal.component';
import { ResetDataService } from './reset-data.service';
import { ElectronService } from '../../../electron/electron.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../../../indexedDb/application-instance-db.service';
import { AnimatedCheckmarkModule } from '../../../shared/animated-checkmark/animated-checkmark.module';
import { ProgressBarComponent } from '../../../shared/progress-bar/progress-bar.component';

type ResetStepMethod = 'restoreExampleItems' | 'deleteUserItems' | 'deleteCustomMaterials' | 'restoreDefaultAppSettings';
type ServiceMethod = ResetStepMethod | 'refreshCaches';

const METHOD_FOR_OPTION: Record<ResetOption, ResetStepMethod> = {
  'example-items': 'restoreExampleItems',
  'user-assessments': 'deleteUserItems',
  'custom-materials': 'deleteCustomMaterials',
  'app-settings': 'restoreDefaultAppSettings',
};
const SERVICE_METHODS: Array<ServiceMethod> = ['restoreExampleItems', 'deleteUserItems', 'deleteCustomMaterials', 'restoreDefaultAppSettings', 'refreshCaches'];
const RUN_ORDER: Array<ResetStepMethod> = RESET_STEPS.map(step => METHOD_FOR_OPTION[step.option]);

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
  let dialogRef: jasmine.SpyObj<DialogRef>;
  let router: jasmine.SpyObj<Router>;
  let electronService: { isElectron: boolean };
  let applicationInstanceData: BehaviorSubject<ApplicationInstanceData>;
  let methodsRun: Array<ServiceMethod>;
  let percentsSeen: Array<number>;

  const select = (...options: Array<ResetOption | 'reset-all'>) => options.forEach(option => component.toggleResetSystemSettingsOption(option));
  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  const button = (label: string): HTMLButtonElement => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
    .find(element => element.textContent.trim() === label);

  const createComponent = () => {
    fixture = TestBed.createComponent(ResetDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // finishDelete reloads the page or relaunches the app; never run it in a test.
    spyOn(component, 'finishDelete');
  };

  beforeEach(async () => {
    methodsRun = [];
    percentsSeen = [];
    resetDataService = jasmine.createSpyObj<ResetDataService>('ResetDataService', [...SERVICE_METHODS, 'deleteAllData']);
    SERVICE_METHODS.forEach(method => resetDataService[method].and.callFake(async () => {
      methodsRun.push(method);
      percentsSeen.push(component.progressPercent);
    }));
    resetDataService.deleteAllData.and.resolveTo();
    dialogRef = jasmine.createSpyObj<DialogRef>('DialogRef', ['close']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    electronService = { isElectron: false };
    applicationInstanceData = new BehaviorSubject<ApplicationInstanceData>({ isAutomaticBackupOn: true } as ApplicationInstanceData);

    await TestBed.configureTestingModule({
      declarations: [ResetDataModalComponent],
      imports: [AnimatedCheckmarkModule, ProgressBarComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: Router, useValue: router },
        { provide: ElectronService, useValue: electronService },
        { provide: ApplicationInstanceDbService, useValue: { applicationInstanceData } },
      ],
    })
      // The modal provides its own ResetDataService, so the fake must replace the component-level provider.
      .overrideComponent(ResetDataModalComponent, { set: { providers: [{ provide: ResetDataService, useValue: resetDataService }] } })
      .compileComponents();

    createComponent();
  });

  describe('running the selected options', () => {
    ISSUE_COMBINATIONS.forEach(options => {
      it(`runs every selected option in order, then refreshes once: ${options.join(' + ')}`, fakeAsync(() => {
        select(...options);

        component.resetSystemSettingsAccept();
        flush();

        const expectedSteps: Array<ResetStepMethod> = RUN_ORDER.filter(method => options.some(option => METHOD_FOR_OPTION[option] === method));
        expect(methodsRun).toEqual([...expectedSteps, 'refreshCaches']);
        expect(resetDataService.deleteAllData).not.toHaveBeenCalled();
        expect(component.status).toBe('succeeded');
        expect(component.progressPercent).toBe(100);
        expect(percentsSeen).withContext('progress never goes backwards').toEqual([...percentsSeen].sort((a, b) => a - b));
      }));
    });

    it('moves the bar inside the example step as it reports progress', fakeAsync(() => {
      resetDataService.restoreExampleItems.and.callFake(async (onProgress: (fractionDone: number) => void) => {
        onProgress(0.5);
        percentsSeen.push(component.progressPercent);
      });
      select('example-items', 'user-assessments');

      component.resetSystemSettingsAccept();
      flush();

      const exampleWeight: number = RESET_STEPS.find(step => step.option === 'example-items').progressWeight;
      const userWeight: number = RESET_STEPS.find(step => step.option === 'user-assessments').progressWeight;
      expect(percentsSeen[0]).toBeCloseTo(100 * exampleWeight * 0.5 / (exampleWeight + userWeight), 5);
    }));
  });

  it('lists the options in the original order, so users don\'t pick the wrong row out of habit', () => {
    const titles: Array<string> = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.reset-option-title'))
      .map(element => element.textContent.trim());

    expect(titles).toEqual(['Reset All Data', 'Reset Application Settings', 'Reset Example Items', 'Delete User Items', 'Delete Custom Materials']);
  });

  describe('Reset All', () => {
    it('deletes the whole database instead of running individual steps, then restarts', fakeAsync(() => {
      select('reset-all');

      component.resetSystemSettingsAccept();
      flush();

      expect(resetDataService.deleteAllData).toHaveBeenCalledTimes(1);
      expect(component.finishDelete).toHaveBeenCalledTimes(1);
      expect(methodsRun).toEqual([]);
    }));

    it('explains a delete held back by another tab and lets the user close the window', fakeAsync(() => {
      resetDataService.deleteAllData.and.callFake((onBlocked: () => void) => {
        onBlocked();
        return new Promise<void>(() => { });
      });
      select('reset-all');

      component.resetSystemSettingsAccept();
      tick();
      fixture.detectChanges();

      expect(text()).toContain('MEASUR is open in another tab or window');
      expect(component.finishDelete).not.toHaveBeenCalled();
      button('Close').click();
      expect(dialogRef.close).toHaveBeenCalledTimes(1);
    }));

    it('turns off when the user unchecks one option, so the database is not wiped', () => {
      select('reset-all', 'user-assessments');

      expect(component.resetAll).toBeFalse();
      expect(component.selectedOptions.size).toBe(RESET_STEPS.length - 1);
    });

    it('stays off when the user checks all four options one by one', () => {
      select('app-settings', 'example-items', 'user-assessments', 'custom-materials');

      expect(component.resetAll).toBeFalse();
    });
  });

  describe('success', () => {
    // Runs inside each test's fakeAsync zone, so the countdown timer it starts is controlled by that test's tick().
    const resetSuccessfully = () => {
      select('custom-materials', 'app-settings');
      component.resetSystemSettingsAccept();
      tick();
      fixture.detectChanges();
    };

    afterEach(() => component.ngOnDestroy());

    it('shows the completed steps and closes itself after the countdown', fakeAsync(() => {
      resetSuccessfully();

      expect(text()).toContain('Reset complete');
      expect(text()).toContain('Custom materials deleted');
      expect(text()).toContain('Application settings restored');
      expect(text()).toContain(`Closing in ${RESET_SUCCESS_CLOSE_DELAY_MS / 1000} s`);

      tick(RESET_SUCCESS_CLOSE_DELAY_MS - 1000);
      expect(dialogRef.close).not.toHaveBeenCalled();
      tick(1000);
      expect(dialogRef.close).toHaveBeenCalledOnceWith({ dataChanged: true });
    }));

    it('"Close now" closes immediately and stops the countdown', fakeAsync(() => {
      resetSuccessfully();

      button('Close now').click();
      tick(RESET_SUCCESS_CLOSE_DELAY_MS);

      expect(dialogRef.close).toHaveBeenCalledOnceWith({ dataChanged: true });
    }));
  });

  describe('failure', () => {
    beforeEach(fakeAsync(() => {
      resetDataService.deleteUserItems.and.rejectWith(new Error('IndexedDB write failed'));
      spyOn(console, 'error');
      select('example-items', 'user-assessments', 'app-settings');
      component.resetSystemSettingsAccept();
      flush();
      fixture.detectChanges();
    }));

    it('stays open and stops at the failed step, instead of raising the app-wide error modal', fakeAsync(() => {
      tick(RESET_SUCCESS_CLOSE_DELAY_MS);

      expect(component.status).toBe('failed');
      expect(component.progressBarStatus).toBe('error');
      expect(methodsRun).toEqual(['restoreExampleItems', 'refreshCaches']);
      expect(dialogRef.close).not.toHaveBeenCalled();
    }));

    it('says what finished, what failed, what did not run and what to do next', () => {
      expect(text()).toContain('Example items restored');
      expect(text()).toContain('Delete User Items: failed');
      expect(text()).toContain('Reset Application Settings: not run');
      expect(text()).toContain(RESET_STEPS.find(step => step.option === 'user-assessments').failureGuidance);
      expect(text()).toContain('reload the page');
      expect(text()).toContain('Data Storage and Backup');
      expect(text()).toContain('measur-help@ornl.gov');
    });

    it('"Try again" runs only the failed step and the ones after it', fakeAsync(() => {
      resetDataService.deleteUserItems.and.callFake(async () => { methodsRun.push('deleteUserItems'); });
      methodsRun = [];

      button('Try again').click();
      tick();

      expect(methodsRun).toEqual(['deleteUserItems', 'restoreDefaultAppSettings', 'refreshCaches']);
      expect(component.status).toBe('succeeded');
      expect(component.progressPercent).toBe(100);
      component.ngOnDestroy();
    }));
  });

  describe('closing', () => {
    it('cannot close while a reset is running', fakeAsync(() => {
      let finishStep: () => void;
      resetDataService.deleteCustomMaterials.and.returnValue(new Promise<void>(resolve => finishStep = resolve));
      select('custom-materials');

      component.resetSystemSettingsAccept();
      tick();
      component.close();
      fixture.detectChanges();

      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('.close')).toBeNull();
      finishStep();
      tick();
      component.ngOnDestroy();
    }));

    it('Cancel closes without resetting anything', () => {
      select('example-items');
      fixture.detectChanges();

      button('Cancel').click();

      expect(methodsRun).toEqual([]);
      expect(dialogRef.close).toHaveBeenCalledOnceWith({ dataChanged: false });
    });

    it('disables Reset until an option is selected and counts the selection', () => {
      expect(button('Reset 0 options').disabled).toBeTrue();

      select('custom-materials', 'app-settings');
      fixture.detectChanges();

      expect(button('Reset 2 options').disabled).toBeFalse();
    });
  });

  describe('backup note', () => {
    it('opens Data Storage and Backup and closes the modal without resetting', () => {
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.backup-note a');
      link.click();

      expect(dialogRef.close).toHaveBeenCalledOnceWith({ dataChanged: false });
      expect(router.navigate).toHaveBeenCalledWith(['/data-and-backup']);
      expect(methodsRun).toEqual([]);
    });

    it('does not show automatic backup status on web', () => {
      expect(fixture.nativeElement.querySelector('.backup-status')).toBeNull();
    });

    it('shows automatic backup status on desktop', () => {
      electronService.isElectron = true;
      applicationInstanceData.next({ isAutomaticBackupOn: false } as ApplicationInstanceData);
      createComponent();

      expect(fixture.nativeElement.querySelector('.backup-status').textContent).toContain('Automatic backup is off');
    });
  });
});
