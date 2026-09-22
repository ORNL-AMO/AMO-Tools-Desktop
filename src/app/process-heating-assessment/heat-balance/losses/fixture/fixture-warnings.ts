import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';

/** Advisory check for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getFixtureFeedRateWarning(loss: FixtureLoss): string | null {
  return loss.feedRate < 0 ? 'Fixture Feed Rate must be greater than 0' : null;
}
