import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverSteamPropertiesComponent } from './hover-steam-properties.component';

describe('HoverSteamPropertiesComponent', () => {
  let component: HoverSteamPropertiesComponent;
  let fixture: ComponentFixture<HoverSteamPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverSteamPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverSteamPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
