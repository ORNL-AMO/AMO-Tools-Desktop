import { AssessmentDbService } from './assessment-db.service';
import { Assessment } from '../shared/models/assessment';
import { firstValueFrom, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { UpdateDataService } from '../shared/helper-services/update-data.service';

const makeAssessment = (id: number, name: string): Assessment => ({ id, name } as unknown as Assessment);

describe('AssessmentDbService.upsertInCache', () => {
  let service: AssessmentDbService;

  beforeEach(() => {
    service = new AssessmentDbService(null, null, null, null);
  });

  it('adds an assessment that is not cached yet, including when the cache was never loaded', () => {
    service.upsertInCache(makeAssessment(1, 'first'));
    expect(service.allAssessments.map((assessment) => assessment.id)).toEqual([1]);
  });

  it('replaces the cached assessment with the same id and keeps the others in order', () => {
    service.allAssessments = [makeAssessment(1, 'one'), makeAssessment(2, 'two'), makeAssessment(3, 'three')];
    service.upsertInCache(makeAssessment(2, 'updated'));
    expect(service.allAssessments.map((assessment) => assessment.name)).toEqual(['one', 'updated', 'three']);
  });

  it('stores a copy, so later edits to the saved object do not reach the cache', () => {
    const saved = makeAssessment(1, 'saved');
    service.upsertInCache(saved);
    saved.name = 'edited later';
    expect(service.findById(1).name).toBe('saved');
  });

  it('emits a new array to subscribers', () => {
    service.allAssessments = [makeAssessment(1, 'one')];
    const previous = service.allAssessments;
    let emitted: Assessment[];
    service.dbAssessments.subscribe((assessments) => emitted = assessments);
    service.upsertInCache(makeAssessment(1, 'updated'));
    expect(emitted).toBe(service.allAssessments);
    expect(emitted).not.toBe(previous);
  });
});

describe('AssessmentDbService pump feature migration', () => {
  it('migrates same-version legacy imports once without replaying unrelated version migrations', async () => {
    const legacy: Assessment = {id: 1, name: 'Legacy pump', type: 'PSAT', appVersion: environment.version,
      psat: {inputs: {pump_style: 6, pump_specified: 83.123456, operating_hours: 8760,
        fluidType: 'Water', fluidTemperature: 68, whatIfScenario: false}}};
    const database = jasmine.createSpyObj<NgxIndexedDBService>('db', ['getAll', 'update']);
    database.getAll.and.returnValue(of([legacy]));
    const upgrades = jasmine.createSpyObj<UpdateDataService>('upgrades', ['updateAssessmentVersion']);
    const service = new AssessmentDbService(database, upgrades, null, null);
    const save = spyOn(service, 'updateWithObservable').and.returnValue(of(legacy));
    await firstValueFrom(service.getAllAssessments());
    expect(legacy.psat.inputs.pump_style).toBe(11);
    expect(legacy.psat.inputs.pump_specified).toBe(83.123456);
    expect(legacy.psat.inputs.whatIfScenario).toBeFalse();
    expect(upgrades.updateAssessmentVersion).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
    await firstValueFrom(service.getAllAssessments());
    expect(save).toHaveBeenCalledTimes(1);
  });
});
