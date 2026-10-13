import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { CalculatorsService } from '../calculators/calculators.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

/** `/treasure-hunt/:id` portion of a URL. */
function getAssessmentPath(url: string): string {
  return url.split('?')[0].split('/').slice(0, 3).join('/');
}

/**
 * Blocks switching main tabs within an assessment while a calculator is open, matching the disabled banner tabs.
 * Leaving the assessment is allowed.
 */
export const openCalculatorGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const calculatorsService: CalculatorsService = inject(CalculatorsService);
  if (calculatorsService.selectedCalc.getValue() === 'none' || getAssessmentPath(currentState.url) !== getAssessmentPath(nextState.url)) {
    return true;
  }
  inject(SnackbarService).setSnackbarMessage('Save or cancel the open calculator before switching tabs.', 'info', 'short');
  return false;
};
