import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { catchError, forkJoin, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { PHAST } from '../models/phast';
import { Settings } from '../../shared/models/settings';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AtmosphereDbService } from '../../indexedDb/atmosphere-db.service';
import { GasLoadMaterialDbService } from '../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../indexedDb/liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from '../../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { MeasurAppError } from '../../shared/errors/errors';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ensureLossIdsForPhast } from '../services/scenario-merge.util';
import { migrateLegacyPhast } from '../services/legacy-phast-migration.util';

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
  private readonly solidLoadMaterialDbService = inject(SolidLoadMaterialDbService);
  private readonly liquidLoadMaterialDbService = inject(LiquidLoadMaterialDbService);
  private readonly gasLoadMaterialDbService = inject(GasLoadMaterialDbService);
  private readonly atmosphereDbService = inject(AtmosphereDbService);
  private readonly wallLossesSurfaceDbService = inject(WallLossesSurfaceDbService);

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
      return from(this.refreshMaterialLists()).pipe(
        map(() => ({ assessment: assessmentValue, settings: settingsValue })),
        catchError(error => this.failResolve(error)),
      );
    }

    let assessment = this.assessmentDbService.findById(Number(id));
    let getAssessment$: Observable<Assessment>;

    if (assessment) {
      getAssessment$ = of(assessment);
    } else {
      // refresh or direct route access - reload DB into memory cache first
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
      switchMap(assessment => from(this.refreshMaterialLists()).pipe(map(() => assessment))),
      switchMap(assessment => {
        this.processHeatingAssessmentService.setAssessment(assessment);
        // Module load-time entry point: `assessment.phast` is still typed against the shared,
        // legacy-owned PHAST shape at this boundary. Everything past this point uses the module's
        // own local PHAST type.
        // Migrating flows through setProcessHeating() below, which feeds the 300ms debounced auto-save like any
        // edit would: opening a legacy assessment here rewrites its modifications to the new shape on disk within
        // ~300ms, even without an explicit edit. Accepted as-is rather than suppressed, since a migrated record
        // stays fully readable by legacy afterward.
        const migratedPhast = migrateLegacyPhast(assessment.phast as unknown as PHAST);
        this.processHeatingAssessmentService.setProcessHeating(ensureLossIdsForPhast(migratedPhast));

        return from(this.processHeatingAssessmentService.initAssessmentSettings(assessment)).pipe(
          switchMap(() =>
            this.processHeatingAssessmentService.settings$.pipe(
              take(1),
              map(settings => ({ assessment, settings }))
            )
          )
        );
      }),
      catchError(error => this.failResolve(error)),
    );
  }

  /** Reloads the material lists the loss forms and Input Summary read, so materials added or deleted elsewhere since the last open show up. */
  private async refreshMaterialLists(): Promise<void> {
    await Promise.all([
      this.solidLoadMaterialDbService.setAllMaterialsFromDb(),
      this.liquidLoadMaterialDbService.setAllMaterialsFromDb(),
      this.gasLoadMaterialDbService.setAllMaterialsFromDb(),
      this.atmosphereDbService.setAllMaterialsFromDb(),
      this.wallLossesSurfaceDbService.setAllMaterialsFromDb(),
    ]);
  }

  private failResolve(error: Error): Observable<never> {
    this.appErrorService.handleAppError('ProcessHeatingAssessmentResolver error', error);
    return throwError(() => new MeasurAppError('ProcessHeatingAssessmentResolver error', error));
  }
}
