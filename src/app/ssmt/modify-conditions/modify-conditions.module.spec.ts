import { ModifyConditionsModule } from './modify-conditions.module';

describe('ModifyConditionsModule', () => {
  let modifyConditionsModule: ModifyConditionsModule;

  beforeEach(() => {
    modifyConditionsModule = new ModifyConditionsModule();
  });

  it('should create an instance', () => {
    expect(modifyConditionsModule).toBeTruthy();
  });
});
