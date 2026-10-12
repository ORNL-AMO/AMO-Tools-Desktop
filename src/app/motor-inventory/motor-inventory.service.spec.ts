import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { MotorInventoryService } from './motor-inventory.service';

function snapshotFor(...dataChain: object[]): ActivatedRouteSnapshot {
  let child: ActivatedRouteSnapshot = undefined;
  [...dataChain].reverse().forEach(data => {
    child = { data, firstChild: child } as ActivatedRouteSnapshot;
  });
  return child;
}

describe('MotorInventoryService routing', () => {
  let service: MotorInventoryService;
  let routerSpy: { navigate: jasmine.Spy };

  beforeEach(() => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        MotorInventoryService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(MotorInventoryService);
    service.currentInventoryId = 5;
  });

  it('syncs the main tab from route data found down the child chain', () => {
    service.syncMainTabFromRoute(snapshotFor({}, { mainView: 'analysis' }));
    expect(service.mainTab.getValue()).toBe('analysis');
  });

  it('leaves the main tab alone when no route data has a main view', () => {
    service.mainTab.next('summary');
    service.syncMainTabFromRoute(snapshotFor({}, {}));
    expect(service.mainTab.getValue()).toBe('summary');
  });

  it('navigates to the main tab route for the current inventory', () => {
    service.goToMainTab('summary');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'summary']);
  });

  it('steps forward and back through the main tabs', () => {
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'summary']);
    service.mainTab.next('summary');
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'analysis']);
    service.backMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'setup']);
  });

  it('does not navigate past the first or last main tab', () => {
    service.backMainTab();
    service.mainTab.next('analysis');
    service.continueMainTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
