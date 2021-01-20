import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatePointAnalysisHelpComponent } from './state-point-analysis-help.component';

describe('StatePointAnalysisHelpComponent', () => {
  let component: StatePointAnalysisHelpComponent;
  let fixture: ComponentFixture<StatePointAnalysisHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatePointAnalysisHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatePointAnalysisHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
