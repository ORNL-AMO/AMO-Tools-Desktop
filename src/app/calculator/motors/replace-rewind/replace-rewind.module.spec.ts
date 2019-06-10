import { ReplaceRewindModule } from './replace-rewind.module';

describe('ReplaceRewindModule', () => {
  let replaceRewindModule: ReplaceRewindModule;

  beforeEach(() => {
    replaceRewindModule = new ReplaceRewindModule();
  });

  it('should create an instance', () => {
    expect(replaceRewindModule).toBeTruthy();
  });
});
