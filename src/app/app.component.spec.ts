import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AnalyticsService } from './shared/analytics/analytics.service';
import { SwUpdate } from '@angular/service-worker';
import { ElectronService } from './electron/electron.service';
import { AppErrorService } from './shared/errors/app-error.service';
import { UpdateApplicationService } from './shared/update-application/update-application.service';
import { ToolsSuiteApiService } from './tools-suite-api/tools-suite-api.service';
import { CoreService } from './core/core.service';
import { EGridService } from './shared/helper-services/e-grid.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: AnalyticsService, useValue: { sendEvent: () => {} } },
        { provide: SwUpdate, useValue: { versionUpdates: EMPTY, unrecoverable: EMPTY } },
        { provide: ElectronService, useValue: { isElectron: false } },
        { provide: AppErrorService, useValue: { measurFormattedError: new Subject(), handleObservableAppError: () => EMPTY } },
        { provide: UpdateApplicationService, useValue: { webUpdateAvailable: { next: () => {} } } },
        { provide: ToolsSuiteApiService, useValue: { initializeModule: () => Promise.resolve() } },
        { provide: CoreService, useValue: { initializedToolsSuiteModule: { next: () => {} } } },
        { provide: EGridService, useValue: { processCSVData: () => Promise.resolve() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
