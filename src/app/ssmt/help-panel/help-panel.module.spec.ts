import { HelpPanelModule } from './help-panel.module';

describe('HelpPanelModule', () => {
  let helpPanelModule: HelpPanelModule;

  beforeEach(() => {
    helpPanelModule = new HelpPanelModule();
  });

  it('should create an instance', () => {
    expect(helpPanelModule).toBeTruthy();
  });
});
