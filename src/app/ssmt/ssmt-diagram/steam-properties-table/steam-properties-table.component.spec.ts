import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesTableComponent } from './steam-properties-table.component';

describe('SteamPropertiesTableComponent', () => {
  let component: SteamPropertiesTableComponent;
  let fixture: ComponentFixture<SteamPropertiesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
