import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { AnalyticsDataIdbService } from '../../indexedDb/analytics-data-idb.service';
import { ElectronService } from '../../electron/electron.service';
import { MockAnalyticsDataIdbService, MockElectronService } from '../../testing/service-mocks';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        provideHttpClient(),
        { provide: AnalyticsDataIdbService, useClass: MockAnalyticsDataIdbService },
        { provide: ElectronService, useClass: MockElectronService }
      ]
    });
    service = TestBed.inject(AnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
