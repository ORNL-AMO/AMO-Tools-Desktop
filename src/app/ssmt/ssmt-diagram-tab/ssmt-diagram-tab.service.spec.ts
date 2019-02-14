import { TestBed, inject } from '@angular/core/testing';

import { SsmtDiagramTabService } from './ssmt-diagram-tab.service';

describe('SsmtDiagramTabService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SsmtDiagramTabService]
    });
  });

  it('should be created', inject([SsmtDiagramTabService], (service: SsmtDiagramTabService) => {
    expect(service).toBeTruthy();
  }));
});
