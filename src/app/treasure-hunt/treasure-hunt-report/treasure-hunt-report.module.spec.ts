import { TreasureHuntReportModule } from './treasure-hunt-report.module';

describe('TreasureHuntReportModule', () => {
  let treasureHuntReportModule: TreasureHuntReportModule;

  beforeEach(() => {
    treasureHuntReportModule = new TreasureHuntReportModule();
  });

  it('should create an instance', () => {
    expect(treasureHuntReportModule).toBeTruthy();
  });
});
