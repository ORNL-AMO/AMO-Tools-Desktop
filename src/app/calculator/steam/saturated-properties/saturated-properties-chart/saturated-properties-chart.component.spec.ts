import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesChartComponent } from './saturated-properties-chart.component';

describe('SaturatedPropertiesChartComponent', () => {
  let component: SaturatedPropertiesChartComponent;
  let fixture: ComponentFixture<SaturatedPropertiesChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
