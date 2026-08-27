import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { catchError, forkJoin, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { PHAST } from '../models/phast';
import { computeMigratedExploreOpportunityFlags, LegacyModification } from '../models/modification';
import { Settings } from '../../shared/models/settings';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { MeasurAppError } from '../../shared/errors/errors';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { computeScenarioOverrides } from '../services/scenario-merge.util';

export interface ProcessHeatingResolverData {
  assessment: Assessment;
  settings: Settings;
}

// URL reference during parallel development:
//   Legacy module:  /phast/:id          (src/app/phast)
//   New module:     /process-heating/:id (src/app/process-heating-assessment)
@Injectable()
export class ProcessHeatingAssessmentResolver implements Resolve<ProcessHeatingResolverData> {
  private readonly appErrorService = inject(AppErrorService);
  private readonly assessmentDbService = inject(AssessmentDbService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly processHeatingAssessmentService = inject(ProcessHeatingAssessmentService);
  private readonly router = inject(Router);

  resolve(route: ActivatedRouteSnapshot): Observable<ProcessHeatingResolverData> {
    const id = route.paramMap.get('assessmentId');
    if (!id || isNaN(Number(id))) {
      this.router.navigate(['/error']);
      return throwError(() => new MeasurAppError('Route Assessment ID is undefined'));
    }

    const assessmentValue = this.processHeatingAssessmentService.assessmentValue;
    const isIdMatch = assessmentValue ? assessmentValue.id === Number(id) : false;
    const settingsValue = this.processHeatingAssessmentService.settingsValue;

    if (assessmentValue && isIdMatch && settingsValue) {
      return of({ assessment: assessmentValue, settings: settingsValue });
    }

    let assessment = this.assessmentDbService.findById(Number(id));
    let getAssessment$: Observable<Assessment>;

    if (assessment) {
      getAssessment$ = of(assessment);
    } else {
      // refresh or direct route access — reload DB into memory cache first
      getAssessment$ = forkJoin([
        this.assessmentDbService.setAll(),
        this.settingsDbService.setAll()
      ]).pipe(
        map(() => {
          assessment = this.assessmentDbService.findById(Number(id));
          if (!assessment) {
            throw new MeasurAppError(`Resolver Assessment ${id} not found`);
          }
          return assessment;
        })
      );
    }

    return getAssessment$.pipe(
      switchMap(assessment => {
        this.processHeatingAssessmentService.setAssessment(assessment);
        // Module load-time entry point: `assessment.phast` is still typed against the shared,
        // legacy-owned PHAST shape at this boundary. Everything past this point uses the module's
        // own local PHAST type.
        const processHeating = assessment.phast as unknown as PHAST;
        // Migrate `scenarioOverrides` and `exploreOpportunityFlags` for modifications last written
        // by legacy (a full `phast` clone and legacy's flat `exploreOppsShowX` fields, neither of
        // which this module reads directly). Idempotent: a modification that already has
        // `scenarioOverrides` (new-module-created, or already migrated) is left untouched, never
        // re-diffed. This flows through setProcessHeating() below, which feeds the 300ms debounced
        // auto-save like any edit would: opening a legacy assessment here rewrites its modifications
        // to the new shape on disk within ~300ms, even without an explicit edit. Accepted as-is
        // rather than suppressed, since `modification.phast` and the legacy `exploreOppsShowX`
        // fields are never touched (only read) — a migrated record stays fully readable by legacy
        // afterward.
        const migratedModifications = processHeating.modifications?.map(modification => {
          const legacyModification = modification as LegacyModification;
          return legacyModification.scenarioOverrides
            ? modification
            : {
              ...modification,
              scenarioOverrides: computeScenarioOverrides(legacyModification.phast, processHeating),
              exploreOpportunityFlags: computeMigratedExploreOpportunityFlags(legacyModification),
            };
        });
        this.processHeatingAssessmentService.setProcessHeating(
          migratedModifications ? { ...processHeating, modifications: migratedModifications } : processHeating
        );

        return from(this.processHeatingAssessmentService.initAssessmentSettings(assessment)).pipe(
          switchMap(() =>
            this.processHeatingAssessmentService.settings$.pipe(
              take(1),
              map(settings => ({ assessment, settings }))
            )
          )
        );
      }),
      catchError(error => {
        this.appErrorService.handleAppError('ProcessHeatingAssessmentResolver error', error);
        return throwError(() => new MeasurAppError('ProcessHeatingAssessmentResolver error', error));
      })
    );
  }
}
