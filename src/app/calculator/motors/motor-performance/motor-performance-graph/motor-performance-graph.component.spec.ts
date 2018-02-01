import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPerformanceGraphComponent } from './motor-performance-graph.component';

describe('MotorPerformanceGraphComponent', () => {
  let component: MotorPerformanceGraphComponent;
  let fixture: ComponentFixture<MotorPerformanceGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPerformanceGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPerformanceGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
