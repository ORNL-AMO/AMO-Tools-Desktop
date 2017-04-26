import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSettingsComponent } from './application-settings.component';

describe('ApplicationSettingsComponent', () => {
  let component: ApplicationSettingsComponent;
  let fixture: ComponentFixture<ApplicationSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
