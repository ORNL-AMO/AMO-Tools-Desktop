import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatSettingsComponent } from './psat-settings.component';

describe('PsatSettingsComponent', () => {
  let component: PsatSettingsComponent;
  let fixture: ComponentFixture<PsatSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
