import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphSeriesComponent } from './graph-series.component';

describe('GraphSeriesComponent', () => {
  let component: GraphSeriesComponent;
  let fixture: ComponentFixture<GraphSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphSeriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
