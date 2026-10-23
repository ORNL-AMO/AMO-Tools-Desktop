import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ProcessHeatingAssessmentResolver } from './process-heating-assessment.resolver';

/**
 * Backs the disabled Assessment and Report tabs for keyboard, history and direct-URL navigation.
 * Guards run before the parent's resolver, so the assessment is loaded here first; the resolver then reuses it.
 * A blocked in-app navigation is cancelled so the user stays on their current step; a blocked first load goes to Baseline.
 */
export const requiresValidBaselineGuard: CanActivateFn = route => {
  const uiService = inject(ProcessHeatingUiService);
  const router = inject(Router);
  const assessmentRoute = route.parent;
  return inject(ProcessHeatingAssessmentResolver).resolve(assessmentRoute).pipe(
    map(() => uiService.canVisitView(route.data['mainView'])
      || (router.navigated ? false : router.createUrlTree(['/process-heating', assessmentRoute.paramMap.get('assessmentId'), ROUTE_TOKENS.baseline]))),
  );
};
