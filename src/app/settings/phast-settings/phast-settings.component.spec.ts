import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastSettingsComponent } from './phast-settings.component';

describe('PhastSettingsComponent', () => {
  let component: PhastSettingsComponent;
  let fixture: ComponentFixture<PhastSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
