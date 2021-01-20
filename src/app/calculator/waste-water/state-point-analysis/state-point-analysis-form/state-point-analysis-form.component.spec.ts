import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatePointAnalysisFormComponent } from './state-point-analysis-form.component';

describe('StatePointAnalysisFormComponent', () => {
  let component: StatePointAnalysisFormComponent;
  let fixture: ComponentFixture<StatePointAnalysisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatePointAnalysisFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatePointAnalysisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
