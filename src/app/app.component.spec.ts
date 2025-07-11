import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { ApplicationRef } from '@angular/core';
import { Router } from '@angular/router';
import { MockAnalyticsService, MockElectronService, MockAppErrorService, MockUpdateApplicationService } from './testing/service-mocks';
import { AnalyticsService } from './shared/analytics/analytics.service';
import { ElectronService } from './electron/electron.service';
import { AppErrorService } from './shared/errors/app-error.service';
import { UpdateApplicationService } from './shared/update-application/update-application.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AnalyticsService, useClass: MockAnalyticsService },
        { provide: ElectronService, useClass: MockElectronService },
        { provide: AppErrorService, useClass: MockAppErrorService },
        { provide: UpdateApplicationService, useClass: MockUpdateApplicationService },
        { provide: SwUpdate, useValue: { versionUpdates: of(), checkForUpdate: () => Promise.resolve(false), unrecoverable: of() } },
        { provide: ApplicationRef, useValue: { isStable: of(true) } },
        { provide: Router, useValue: { events: of() } }
        
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
