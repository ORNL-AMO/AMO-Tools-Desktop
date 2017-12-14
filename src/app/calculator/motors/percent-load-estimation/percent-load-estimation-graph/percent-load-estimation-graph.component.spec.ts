import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentLoadEstimationGraphComponent } from './percent-load-estimation-graph.component';

describe('PercentLoadEstimationGraphComponent', () => {
  let component: PercentLoadEstimationGraphComponent;
  let fixture: ComponentFixture<PercentLoadEstimationGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentLoadEstimationGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentLoadEstimationGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
