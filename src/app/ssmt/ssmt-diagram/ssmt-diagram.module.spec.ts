import { SsmtDiagramModule } from './ssmt-diagram.module';

describe('SsmtDiagramModule', () => {
  let ssmtDiagramModule: SsmtDiagramModule;

  beforeEach(() => {
    ssmtDiagramModule = new SsmtDiagramModule();
  });

  it('should create an instance', () => {
    expect(ssmtDiagramModule).toBeTruthy();
  });
});
