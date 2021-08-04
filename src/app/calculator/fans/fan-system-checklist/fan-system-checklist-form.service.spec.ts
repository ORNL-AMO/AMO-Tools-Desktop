import { TestBed } from '@angular/core/testing';
import { FanSystemChecklistFormService } from './fan-system-checklist-form.service';


describe('FanSystemChecklistFormService', () => {
  let service: FanSystemChecklistFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FanSystemChecklistFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
