import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatePointAnalysisComponent } from './state-point-analysis.component';

describe('StatePointAnalysisComponent', () => {
  let component: StatePointAnalysisComponent;
  let fixture: ComponentFixture<StatePointAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatePointAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatePointAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
