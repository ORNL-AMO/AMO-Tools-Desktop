import { HoverTableModule } from './hover-table.module';

describe('HoverTableModule', () => {
  let hoverTableModule: HoverTableModule;

  beforeEach(() => {
    hoverTableModule = new HoverTableModule();
  });

  it('should create an instance', () => {
    expect(hoverTableModule).toBeTruthy();
  });
});
