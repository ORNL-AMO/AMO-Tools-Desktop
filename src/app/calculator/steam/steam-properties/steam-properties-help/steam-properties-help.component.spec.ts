import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesHelpComponent } from './steam-properties-help.component';

describe('SteamPropertiesHelpComponent', () => {
  let component: SteamPropertiesHelpComponent;
  let fixture: ComponentFixture<SteamPropertiesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
