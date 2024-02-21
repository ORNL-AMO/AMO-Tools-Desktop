import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailMeasurDataModalComponent } from './email-measur-data-modal.component';

describe('EmailMeasurDataModalComponent', () => {
  let component: EmailMeasurDataModalComponent;
  let fixture: ComponentFixture<EmailMeasurDataModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailMeasurDataModalComponent]
    });
    fixture = TestBed.createComponent(EmailMeasurDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
