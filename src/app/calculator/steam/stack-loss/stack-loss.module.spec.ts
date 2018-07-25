import { StackLossModule } from './stack-loss.module';

describe('StackLossModule', () => {
  let stackLossModule: StackLossModule;

  beforeEach(() => {
    stackLossModule = new StackLossModule();
  });

  it('should create an instance', () => {
    expect(stackLossModule).toBeTruthy();
  });
});
