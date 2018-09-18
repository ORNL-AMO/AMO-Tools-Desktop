import { ExploreOpportunitiesModule } from './explore-opportunities.module';

describe('ExploreOpportunitiesModule', () => {
  let exploreOpportunitiesModule: ExploreOpportunitiesModule;

  beforeEach(() => {
    exploreOpportunitiesModule = new ExploreOpportunitiesModule();
  });

  it('should create an instance', () => {
    expect(exploreOpportunitiesModule).toBeTruthy();
  });
});
