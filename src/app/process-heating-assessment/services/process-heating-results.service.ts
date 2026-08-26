import { inject, Injectable } from '@angular/core';
import { PHAST, PhastResults } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';

@Injectable()
export class ProcessHeatingResultsService {
  private readonly phastResultsService = inject(PhastResultsService);

  getResults(phast: PHAST, settings: Settings): PhastResults | undefined {
    if (!phast || !settings || !phast.losses) return undefined;
    return this.phastResultsService.getResults(phast, settings);
  }
}
