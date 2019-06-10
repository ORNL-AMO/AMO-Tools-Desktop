import { SsmtDiagramTabModule } from './ssmt-diagram-tab.module';

describe('SsmtDiagramTabModule', () => {
  let ssmtDiagramTabModule: SsmtDiagramTabModule;

  beforeEach(() => {
    ssmtDiagramTabModule = new SsmtDiagramTabModule();
  });

  it('should create an instance', () => {
    expect(ssmtDiagramTabModule).toBeTruthy();
  });
});
