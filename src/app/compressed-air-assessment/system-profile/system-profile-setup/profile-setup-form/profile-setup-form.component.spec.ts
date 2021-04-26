import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSetupFormComponent } from './profile-setup-form.component';

describe('ProfileSetupFormComponent', () => {
  let component: ProfileSetupFormComponent;
  let fixture: ComponentFixture<ProfileSetupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileSetupFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSetupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
