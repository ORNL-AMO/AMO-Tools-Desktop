import { TreasureHuntModule } from './treasure-hunt.module';

describe('TreasureHuntModule', () => {
  let treasureHuntModule: TreasureHuntModule;

  beforeEach(() => {
    treasureHuntModule = new TreasureHuntModule();
  });

  it('should create an instance', () => {
    expect(treasureHuntModule).toBeTruthy();
  });
});
