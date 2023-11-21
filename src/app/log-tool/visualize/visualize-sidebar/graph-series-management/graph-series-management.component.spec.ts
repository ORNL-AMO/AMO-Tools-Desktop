import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphSeriesManagementComponent } from './graph-series-management.component';

describe('GraphSeriesManagementComponent', () => {
  let component: GraphSeriesManagementComponent;
  let fixture: ComponentFixture<GraphSeriesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphSeriesManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphSeriesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
