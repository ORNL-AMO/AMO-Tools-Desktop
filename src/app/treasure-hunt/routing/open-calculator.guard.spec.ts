import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { treasureHuntRoutes } from './treasure-hunt.routing';
import { CalculatorsService } from '../calculators/calculators.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

@Component({ template: '', standalone: true })
class StubComponent {}

describe('openCalculatorGuard', () => {
  let router: Router;
  let location: Location;
  let selectedCalc: BehaviorSubject<string>;
  let snackbarSpy: jasmine.SpyObj<SnackbarService>;

  beforeEach(() => {
    selectedCalc = new BehaviorSubject<string>('none');
    snackbarSpy = jasmine.createSpyObj('SnackbarService', ['setSnackbarMessage']);
    TestBed.configureTestingModule({
      providers: [
        { provide: CalculatorsService, useValue: { selectedCalc } },
        { provide: SnackbarService, useValue: snackbarSpy },
        provideRouter([
          { path: 'treasure-hunt/:id', component: StubComponent, children: treasureHuntRoutes },
          { path: 'landing-screen', component: StubComponent },
        ]),
        provideLocationMocks()
      ]
    });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('allows switching main tabs when no calculator is open', async () => {
    await router.navigateByUrl('/treasure-hunt/5/baseline');
    await router.navigateByUrl('/treasure-hunt/5/report');
    expect(router.url).toBe('/treasure-hunt/5/report');
    expect(snackbarSpy.setSnackbarMessage).not.toHaveBeenCalled();
  });

  it('blocks switching main tabs while a calculator is open and tells the user', async () => {
    await router.navigateByUrl('/treasure-hunt/5/find-treasure');
    selectedCalc.next('air-leak');
    await router.navigateByUrl('/treasure-hunt/5/report');
    expect(router.url).toBe('/treasure-hunt/5/find-treasure');
    expect(snackbarSpy.setSnackbarMessage).toHaveBeenCalledTimes(1);
  });

  it('blocks browser back while a calculator is open', async () => {
    router.initialNavigation();
    await router.navigateByUrl('/treasure-hunt/5/baseline');
    await router.navigateByUrl('/treasure-hunt/5/find-treasure');
    selectedCalc.next('air-leak');
    location.back();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/treasure-hunt/5/find-treasure');
    expect(snackbarSpy.setSnackbarMessage).toHaveBeenCalled();
  });

  it('allows leaving the assessment while a calculator is open', async () => {
    await router.navigateByUrl('/treasure-hunt/5/find-treasure');
    selectedCalc.next('air-leak');
    await router.navigateByUrl('/landing-screen');
    expect(router.url).toBe('/landing-screen');
  });

  it('allows switching main tabs again once the calculator is closed', async () => {
    await router.navigateByUrl('/treasure-hunt/5/find-treasure');
    selectedCalc.next('air-leak');
    await router.navigateByUrl('/treasure-hunt/5/report');
    selectedCalc.next('none');
    await router.navigateByUrl('/treasure-hunt/5/report');
    expect(router.url).toBe('/treasure-hunt/5/report');
  });
});
