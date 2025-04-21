import { TestBed } from '@angular/core/testing';

import { EmailListSubscribeService } from './email-list-subscribe.service';

describe('EmailListSubscribeService', () => {
  let service: EmailListSubscribeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailListSubscribeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
