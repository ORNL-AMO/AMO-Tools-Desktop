import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCurveGraphComponent } from './system-curve-graph.component';

describe('SystemCurveGraphComponent', () => {
  let component: SystemCurveGraphComponent;
  let fixture: ComponentFixture<SystemCurveGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemCurveGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCurveGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
