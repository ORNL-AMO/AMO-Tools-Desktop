import { SsmtReportModule } from './ssmt-report.module';

describe('SsmtReportModule', () => {
  let ssmtReportModule: SsmtReportModule;

  beforeEach(() => {
    ssmtReportModule = new SsmtReportModule();
  });

  it('should create an instance', () => {
    expect(ssmtReportModule).toBeTruthy();
  });
});
