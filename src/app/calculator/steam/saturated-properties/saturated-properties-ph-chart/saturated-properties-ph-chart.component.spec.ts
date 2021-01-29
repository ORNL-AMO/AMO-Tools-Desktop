import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesPhChartComponent } from './saturated-properties-ph-chart.component';

describe('SaturatedPropertiesPhChartComponent', () => {
  let component: SaturatedPropertiesPhChartComponent;
  let fixture: ComponentFixture<SaturatedPropertiesPhChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesPhChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesPhChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
