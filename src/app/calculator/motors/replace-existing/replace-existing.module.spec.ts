import { ReplaceExistingModule } from './replace-existing.module';

describe('ReplaceExistingModule', () => {
  let replaceExistingModule: ReplaceExistingModule;

  beforeEach(() => {
    replaceExistingModule = new ReplaceExistingModule();
  });

  it('should create an instance', () => {
    expect(replaceExistingModule).toBeTruthy();
  });
});
