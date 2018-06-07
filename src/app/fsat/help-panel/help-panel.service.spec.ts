import { TestBed, inject } from '@angular/core/testing';

import { HelpPanelService } from './help-panel.service';

describe('HelpPanelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HelpPanelService]
    });
  });

  it('should be created', inject([HelpPanelService], (service: HelpPanelService) => {
    expect(service).toBeTruthy();
  }));
});
