import { FsatSankeyModule } from './fsat-sankey.module';

describe('FsatSankeyModule', () => {
  let fsatSankeyModule: FsatSankeyModule;

  beforeEach(() => {
    fsatSankeyModule = new FsatSankeyModule();
  });

  it('should create an instance', () => {
    expect(fsatSankeyModule).toBeTruthy();
  });
});
