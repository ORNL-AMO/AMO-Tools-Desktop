import { SsmtResultsPanelModule } from './ssmt-results-panel.module';

describe('SsmtResultsPanelModule', () => {
  let ssmtResultsPanelModule: SsmtResultsPanelModule;

  beforeEach(() => {
    ssmtResultsPanelModule = new SsmtResultsPanelModule();
  });

  it('should create an instance', () => {
    expect(ssmtResultsPanelModule).toBeTruthy();
  });
});
