import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesComponent } from './steam-properties.component';

describe('SteamPropertiesComponent', () => {
  let component: SteamPropertiesComponent;
  let fixture: ComponentFixture<SteamPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
