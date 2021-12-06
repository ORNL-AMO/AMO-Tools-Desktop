import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfileAnnualSummaryComponent } from './system-profile-annual-summary.component';

describe('SystemProfileAnnualSummaryComponent', () => {
  let component: SystemProfileAnnualSummaryComponent;
  let fixture: ComponentFixture<SystemProfileAnnualSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemProfileAnnualSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemProfileAnnualSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
