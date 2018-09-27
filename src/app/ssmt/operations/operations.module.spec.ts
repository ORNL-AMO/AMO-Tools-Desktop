import { OperationsModule } from './operations.module';

describe('OperationsModule', () => {
  let operationsModule: OperationsModule;

  beforeEach(() => {
    operationsModule = new OperationsModule();
  });

  it('should create an instance', () => {
    expect(operationsModule).toBeTruthy();
  });
});
