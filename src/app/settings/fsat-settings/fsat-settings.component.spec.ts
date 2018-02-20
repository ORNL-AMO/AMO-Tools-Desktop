import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatSettingsComponent } from './fsat-settings.component';

describe('FsatSettingsComponent', () => {
  let component: FsatSettingsComponent;
  let fixture: ComponentFixture<FsatSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
