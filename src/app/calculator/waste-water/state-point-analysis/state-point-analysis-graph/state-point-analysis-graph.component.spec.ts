import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatePointAnalysisGraphComponent } from './state-point-analysis-graph.component';

describe('StatePointAnalysisGraphComponent', () => {
  let component: StatePointAnalysisGraphComponent;
  let fixture: ComponentFixture<StatePointAnalysisGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatePointAnalysisGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatePointAnalysisGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
