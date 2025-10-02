import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemProfileSetupTabsComponent } from './system-profile-setup-tabs.component';

describe('SystemProfileSetupTabsComponent', () => {
  let component: SystemProfileSetupTabsComponent;
  let fixture: ComponentFixture<SystemProfileSetupTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemProfileSetupTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemProfileSetupTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
