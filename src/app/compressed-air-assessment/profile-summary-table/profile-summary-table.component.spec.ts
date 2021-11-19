import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSummaryTableComponent } from './profile-summary-table.component';

describe('ProfileSummaryTableComponent', () => {
  let component: ProfileSummaryTableComponent;
  let fixture: ComponentFixture<ProfileSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileSummaryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
