import { inject, Injectable } from '@angular/core';
import { PHAST, PhastResults } from '../models/phast';
import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';

@Injectable()
export class ProcessHeatingResultsService {
  private readonly phastResultsService = inject(PhastResultsService);

  getResults(phast: PHAST, settings: Settings): PhastResults | undefined {
    if (!phast || !settings || !phast.losses) return undefined;
    // The legacy results service still expects the shared, legacy-owned PHAST shape.
    return this.phastResultsService.getResults(phast as unknown as SharedPHAST, settings);
  }
}
