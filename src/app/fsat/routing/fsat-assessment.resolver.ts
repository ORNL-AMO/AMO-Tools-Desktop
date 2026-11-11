import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { FSAT, Modification } from '../../shared/models/fans';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FsatService } from '../fsat.service';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { MeasurAppError } from '../../shared/errors/errors';

export interface FsatResolverData {
  assessment: Assessment;
  settings: Settings;
}

@Injectable()
export class FsatAssessmentResolver implements Resolve<FsatResolverData> {
  private appErrorService = inject(AppErrorService);
  private assessmentDbService = inject(AssessmentDbService);
  private settingsDbService = inject(SettingsDbService);
  private fsatService = inject(FsatService);
  private router = inject(Router);

  resolve(route: ActivatedRouteSnapshot): Observable<FsatResolverData> {
    const id = route.paramMap.get('id');
    if (!id || isNaN(Number(id))) {
      this.router.navigate(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
      return throwError(() => new MeasurAppError('Route Assessment ID is undefined'));
    }

    let assessment = this.assessmentDbService.findById(Number(id));
    let getAssessment$: Observable<Assessment>;
    if (assessment) {
      // * is first load of this assessment
      getAssessment$ = of(assessment);
    } else {
      // * is refresh or direct route access — reload DB into memory cache first
      getAssessment$ = forkJoin([
        this.assessmentDbService.setAll(),
        this.settingsDbService.setAll()
      ]).pipe(
        map(() => this.assessmentDbService.findById(Number(id)))
      );
    }

    return getAssessment$.pipe(
      switchMap(foundAssessment => {
        if (!foundAssessment || foundAssessment.type !== 'FSAT') {
          this.router.navigate(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
          return throwError(() => new MeasurAppError(`FsatAssessmentResolver: assessment ${id} not found or not FSAT`));
        }

        const fsat: FSAT = JSON.parse(JSON.stringify(foundAssessment.fsat));
        if (!fsat.modifications) {
          fsat.modifications = new Array<Modification>();
        }

        return from(this.fsatService.initAssessmentSettings(foundAssessment)).pipe(
          map(settings => {
            this.fsatService.seedAssessment(foundAssessment, fsat, settings);
            return { assessment: foundAssessment, settings };
          })
        );
      }),
      catchError(error => {
        this.appErrorService.handleAppError('FsatAssessmentResolver error', error);
        return throwError(() => new MeasurAppError('FsatAssessmentResolver error', error));
      })
    );
  }
}
