import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { processCoolingAssessmentResolverResolver } from './process-cooling-assessment-resolver.resolver';

describe('processCoolingAssessmentResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => processCoolingAssessmentResolverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
