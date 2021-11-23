import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfileSetupComponent } from './system-profile-setup.component';

describe('SystemProfileSetupComponent', () => {
  let component: SystemProfileSetupComponent;
  let fixture: ComponentFixture<SystemProfileSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemProfileSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemProfileSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
