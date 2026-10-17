import { AssessmentDbService } from './assessment-db.service';
import { Assessment } from '../shared/models/assessment';

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
