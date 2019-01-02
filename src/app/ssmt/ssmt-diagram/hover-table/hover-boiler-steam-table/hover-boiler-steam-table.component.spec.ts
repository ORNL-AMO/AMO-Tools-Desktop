import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverBoilerSteamTableComponent } from './hover-boiler-steam-table.component';

describe('HoverBoilerSteamTableComponent', () => {
  let component: HoverBoilerSteamTableComponent;
  let fixture: ComponentFixture<HoverBoilerSteamTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverBoilerSteamTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverBoilerSteamTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
