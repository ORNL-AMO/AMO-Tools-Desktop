import { FlashTankModule } from './flash-tank.module';

describe('FlashTankModule', () => {
  let flashTankModule: FlashTankModule;

  beforeEach(() => {
    flashTankModule = new FlashTankModule();
  });

  it('should create an instance', () => {
    expect(flashTankModule).toBeTruthy();
  });
});
