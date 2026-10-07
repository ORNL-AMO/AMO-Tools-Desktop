import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { FsatAssessmentResolver } from './fsat-assessment.resolver';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FsatService } from '../fsat.service';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';

describe('FsatAssessmentResolver', () => {
  let resolver: FsatAssessmentResolver;
  let assessmentDbService: jasmine.SpyObj<AssessmentDbService>;
  let settingsDbService: jasmine.SpyObj<SettingsDbService>;
  let fsatService: jasmine.SpyObj<FsatService>;
  let router: jasmine.SpyObj<Router>;

  const fsatAssessment: Assessment = { id: 12, type: 'FSAT', fsat: { modifications: [] } } as unknown as Assessment;
  const otherAssessment: Assessment = { id: 13, type: 'PSAT' } as unknown as Assessment;
  const settings: Settings = { id: 1, assessmentId: 12 } as Settings;

  function routeSnapshotWithId(id: string | null): ActivatedRouteSnapshot {
    return { paramMap: convertToParamMap(id ? { id } : {}) } as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    assessmentDbService = jasmine.createSpyObj('AssessmentDbService', ['findById', 'setAll']);
    settingsDbService = jasmine.createSpyObj('SettingsDbService', ['setAll']);
    fsatService = jasmine.createSpyObj('FsatService', ['seedAssessment', 'initAssessmentSettings']);
    fsatService.initAssessmentSettings.and.returnValue(Promise.resolve(settings));
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        FsatAssessmentResolver,
        { provide: AssessmentDbService, useValue: assessmentDbService },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: FsatService, useValue: fsatService },
        { provide: Router, useValue: router },
        { provide: AppErrorService, useValue: jasmine.createSpyObj('AppErrorService', ['handleAppError']) },
      ]
    });
    resolver = TestBed.inject(FsatAssessmentResolver);
  });

  it('redirects to not-found and errors when the id param is missing', (done) => {
    resolver.resolve(routeSnapshotWithId(null)).subscribe({
      error: () => {
        expect(router.navigate).toHaveBeenCalledWith(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
        done();
      }
    });
  });

  it('resolves and seeds FsatService when the assessment is already in memory', (done) => {
    assessmentDbService.findById.and.returnValue(fsatAssessment);

    resolver.resolve(routeSnapshotWithId('12')).subscribe(data => {
      expect(data.assessment).toBe(fsatAssessment);
      expect(data.settings).toBe(settings);
      expect(assessmentDbService.setAll).not.toHaveBeenCalled();
      expect(fsatService.initAssessmentSettings).toHaveBeenCalledWith(fsatAssessment);
      expect(fsatService.seedAssessment).toHaveBeenCalledWith(fsatAssessment, jasmine.objectContaining({ modifications: [] }), settings);
      done();
    });
  });

  it('reloads from IndexedDB and retries when the assessment is not yet in memory', (done) => {
    assessmentDbService.findById.and.returnValues(undefined, fsatAssessment);
    assessmentDbService.setAll.and.returnValue(Promise.resolve());
    settingsDbService.setAll.and.returnValue(Promise.resolve());

    resolver.resolve(routeSnapshotWithId('12')).subscribe(data => {
      expect(assessmentDbService.setAll).toHaveBeenCalled();
      expect(settingsDbService.setAll).toHaveBeenCalled();
      expect(data.assessment).toBe(fsatAssessment);
      expect(fsatService.seedAssessment).toHaveBeenCalled();
      done();
    });
  });

  it('redirects to not-found and errors when the assessment is not an FSAT assessment', (done) => {
    assessmentDbService.findById.and.returnValue(otherAssessment);

    resolver.resolve(routeSnapshotWithId('13')).subscribe({
      error: () => {
        expect(router.navigate).toHaveBeenCalledWith(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
        expect(fsatService.seedAssessment).not.toHaveBeenCalled();
        done();
      }
    });
  });
});
