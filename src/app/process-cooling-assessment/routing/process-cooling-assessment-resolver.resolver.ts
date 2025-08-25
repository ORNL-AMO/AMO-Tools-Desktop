import { ActivatedRouteSnapshot, Resolve, ResolveFn, Router } from '@angular/router';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { Injectable } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { catchError, forkJoin, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { EGridService } from '../../shared/helper-services/e-grid.service';
import { Settings } from '../../shared/models/settings';
import { MeasurAppError } from '../../shared/errors/errors';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ChillerInventoryService } from '../services/chiller-inventory.service';

export interface ProcessCoolingResolverData {
  assessment: Assessment;
  settings: Settings;
}

@Injectable()
export class ProcessCoolingAssessmentResolver implements Resolve<ProcessCoolingResolverData> {

  constructor(
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService,
    private processCoolingAssessmentService: ProcessCoolingAssessmentService,
    private inventoryService: ChillerInventoryService,
    private egridService: EGridService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<ProcessCoolingResolverData> {
    console.time('ProcessCoolingAssessmentResolver.resolve');
    const id = route.paramMap.get('assessmentId');
    if (!id || isNaN(Number(id))) {
      this.router.navigate(['/error']);
      return throwError(() => new MeasurAppError('Route Assessment ID is undefined'));
    }

    const assessmentValue = this.processCoolingAssessmentService.assessmentValue;
    const settingsValue = this.processCoolingAssessmentService.settingsValue;
    if (assessmentValue && settingsValue) {
      console.timeEnd('ProcessCoolingAssessmentResolver.resolve');
      return of({
        assessment: assessmentValue,
        settings: settingsValue
      }).pipe(
        map(data => ({ assessment: data.assessment, settings: data.settings }))
      );

    }

    let assessment = this.assessmentDbService.findById(Number(id));
    let getAssessment$: Observable<Assessment>;
    if (assessment) {
      // * is first load
      getAssessment$ = of(assessment);
    } else {
      // * is refresh or direct route access
      // todo This getAssessment$ block is a workaround for an old pattern - core.service init db logic should be refactored so it's in an appInitializer and we don't set all data here
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

    const initializedModuleData$ = getAssessment$.pipe(
      switchMap(assessment => {
        this.processCoolingAssessmentService.setAssessment(assessment);
        this.processCoolingAssessmentService.setProcessCooling(assessment.processCooling);
        if (!this.egridService.subRegionsByZipcode) {
          this.egridService.getAllSubRegions();
        }
        this.inventoryService.setDefaultSelectedChiller(assessment.processCooling.inventory);

        return from(this.processCoolingAssessmentService.initAssessmentSettings(assessment)).pipe(
          switchMap(() =>
            this.processCoolingAssessmentService.settings$.pipe(
              take(1),
              map(settings => ({
                assessment,
                settings
              }))
            )
          )
        );
      }),
      catchError(error => {
        console.error('Resolver initializedModuleData error:', error);
        return throwError(() => new MeasurAppError('Resolver initializedModuleData error', error));
      })
    );

    console.timeEnd('ProcessCoolingAssessmentResolver.resolve');

    return initializedModuleData$;
  }
}
