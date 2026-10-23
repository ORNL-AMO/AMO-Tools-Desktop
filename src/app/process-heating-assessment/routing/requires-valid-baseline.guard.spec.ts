import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ProcessHeatingAssessmentResolver, ProcessHeatingResolverData } from './process-heating-assessment.resolver';
import { requiresValidBaselineGuard } from './requires-valid-baseline.guard';

describe('requiresValidBaselineGuard', () => {
  let canVisit: boolean;
  let navigated: boolean;
  let calls: string[];

  const route = {
    data: { mainView: 'report' },
    parent: { paramMap: convertToParamMap({ assessmentId: '7' }) },
  } as unknown as ActivatedRouteSnapshot;

  const runGuard = (): Promise<boolean | UrlTree> => {
    TestBed.inject(Router).navigated = navigated;
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(requiresValidBaselineGuard(route, {} as RouterStateSnapshot) as Observable<boolean | UrlTree>));
  };

  beforeEach(() => {
    canVisit = true;
    navigated = true;
    calls = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProcessHeatingAssessmentResolver,
          useValue: { resolve: () => { calls.push('resolve'); return of({} as ProcessHeatingResolverData); } },
        },
        {
          provide: ProcessHeatingUiService,
          useValue: { canVisitView: (view: string) => { calls.push(`canVisitView:${view}`); return canVisit; } },
        },
      ],
    });
  });

  it('loads the assessment before checking the view', async () => {
    expect(await runGuard()).toBeTrue();
    expect(calls).toEqual(['resolve', 'canVisitView:report']);
  });

  it('cancels an in-app navigation while the baseline is invalid', async () => {
    canVisit = false;

    expect(await runGuard()).toBeFalse();
  });

  it('sends a blocked first load to Baseline', async () => {
    canVisit = false;
    navigated = false;

    const result = await runGuard();

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/process-heating/7/baseline');
  });
});
