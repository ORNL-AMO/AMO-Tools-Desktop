// Place all shared Angular service mocks here for use in tests
import { BehaviorSubject, of, Subject } from 'rxjs';

export class MockAnalyticsService {
  sendEvent = jasmine.createSpy('sendEvent');
  getPageWithoutId = jasmine.createSpy('getPageWithoutId').and.callFake((path: string) => path);
}

export class MockElectronService {
  isElectron = false;
}

export class MockAppErrorService {
  measurFormattedError = new BehaviorSubject<any>(undefined);
  handleObservableAppError = jasmine.createSpy('handleObservableAppError').and.returnValue(of(undefined));
}

export class MockUpdateApplicationService {
  webUpdateAvailable = new BehaviorSubject<boolean>(false);
}



const routerEventsMock = new BehaviorSubject<any>(null);

