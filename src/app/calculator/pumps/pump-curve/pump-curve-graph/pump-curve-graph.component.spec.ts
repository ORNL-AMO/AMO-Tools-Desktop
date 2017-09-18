import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCurveGraphComponent } from './pump-curve-graph.component';

describe('PumpCurveGraphComponent', () => {
  let component: PumpCurveGraphComponent;
  let fixture: ComponentFixture<PumpCurveGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpCurveGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCurveGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
