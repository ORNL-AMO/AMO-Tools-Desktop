import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { PHAST, PhastResults } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';

@Injectable()
export class ProcessHeatingResultsService {
  private readonly processHeatingAssessmentService = inject(ProcessHeatingAssessmentService);
  private readonly phastResultsService = inject(PhastResultsService);

  readonly baselineResults$: Observable<PhastResults | undefined> = combineLatest([
    this.processHeatingAssessmentService.processHeating$,
    this.processHeatingAssessmentService.settings$,
  ]).pipe(
    map(([phast, settings]) => this.getResults(phast, settings))
  );

  readonly modificationResults$: Observable<PhastResults[]> = combineLatest([
    this.processHeatingAssessmentService.processHeating$,
    this.processHeatingAssessmentService.settings$,
  ]).pipe(
    map(([phast, settings]) => {
      if (!phast?.modifications || !settings) return [];
      return phast.modifications
        .filter(mod => mod.phast)
        .map(mod => this.phastResultsService.getResults(mod.phast, settings));
    })
  );

  getResults(phast: PHAST, settings: Settings): PhastResults | undefined {
    if (!phast || !settings || !phast.losses) return undefined;
    return this.phastResultsService.getResults(phast, settings);
  }
}
