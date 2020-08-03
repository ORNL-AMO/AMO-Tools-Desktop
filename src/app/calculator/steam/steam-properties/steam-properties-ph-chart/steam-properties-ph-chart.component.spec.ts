import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesPhChartComponent } from './steam-properties-ph-chart.component';

describe('SteamPropertiesPhChartComponent', () => {
  let component: SteamPropertiesPhChartComponent;
  let fixture: ComponentFixture<SteamPropertiesPhChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesPhChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesPhChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
