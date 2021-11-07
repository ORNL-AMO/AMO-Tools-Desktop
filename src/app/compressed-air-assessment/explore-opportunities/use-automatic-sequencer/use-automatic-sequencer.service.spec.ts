import { TestBed } from '@angular/core/testing';

import { UseAutomaticSequencerService } from './use-automatic-sequencer.service';

describe('UseAutomaticSequencerService', () => {
  let service: UseAutomaticSequencerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseAutomaticSequencerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
