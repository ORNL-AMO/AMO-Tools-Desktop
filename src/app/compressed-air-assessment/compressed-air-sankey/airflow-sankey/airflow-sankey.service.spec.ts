import { TestBed } from '@angular/core/testing';

import { AirflowSankeyService } from './airflow-sankey.service';

describe('AirflowSankeyService', () => {
  let service: AirflowSankeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirflowSankeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
