import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { catchError, forkJoin, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { PHAST } from '../models/phast';
import { Settings } from '../../shared/models/settings';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { MeasurAppError } from '../../shared/errors/errors';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';

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
        this.processHeatingAssessmentService.setProcessHeating(assessment.phast as unknown as PHAST);

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
