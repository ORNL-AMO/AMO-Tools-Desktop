import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfilesComponent } from './system-profiles.component';

describe('SystemProfilesComponent', () => {
  let component: SystemProfilesComponent;
  let fixture: ComponentFixture<SystemProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemProfilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
