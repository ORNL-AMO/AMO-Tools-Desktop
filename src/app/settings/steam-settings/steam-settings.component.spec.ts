import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamSettingsComponent } from './steam-settings.component';

describe('SteamSettingsComponent', () => {
  let component: SteamSettingsComponent;
  let fixture: ComponentFixture<SteamSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
