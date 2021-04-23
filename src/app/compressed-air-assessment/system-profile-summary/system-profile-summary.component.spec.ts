import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfileSummaryComponent } from './system-profile-summary.component';

describe('SystemProfileSummaryComponent', () => {
  let component: SystemProfileSummaryComponent;
  let fixture: ComponentFixture<SystemProfileSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemProfileSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemProfileSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
