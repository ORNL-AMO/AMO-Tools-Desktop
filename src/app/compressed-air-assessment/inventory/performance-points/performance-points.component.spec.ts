import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePointsComponent } from './performance-points.component';

describe('PerformancePointsComponent', () => {
  let component: PerformancePointsComponent;
  let fixture: ComponentFixture<PerformancePointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformancePointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformancePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
