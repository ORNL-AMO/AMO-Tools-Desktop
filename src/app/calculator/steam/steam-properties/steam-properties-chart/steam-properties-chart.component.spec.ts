import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesChartComponent } from './steam-properties-chart.component';

describe('SteamPropertiesChartComponent', () => {
  let component: SteamPropertiesChartComponent;
  let fixture: ComponentFixture<SteamPropertiesChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
