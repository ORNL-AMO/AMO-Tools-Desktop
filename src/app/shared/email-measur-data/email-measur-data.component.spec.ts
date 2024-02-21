import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailMeasurDataComponent } from './email-measur-data.component';

describe('EmailMeasurDataComponent', () => {
  let component: EmailMeasurDataComponent;
  let fixture: ComponentFixture<EmailMeasurDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailMeasurDataComponent]
    });
    fixture = TestBed.createComponent(EmailMeasurDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
