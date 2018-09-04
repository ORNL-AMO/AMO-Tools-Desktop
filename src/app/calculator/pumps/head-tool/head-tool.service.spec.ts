import { TestBed, inject } from '@angular/core/testing';

import { HeadToolService } from './head-tool.service';

describe('HeadToolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeadToolService]
    });
  });

  it('should be created', inject([HeadToolService], (service: HeadToolService) => {
    expect(service).toBeTruthy();
  }));
});
