import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanAnalysisFormComponent } from './fan-analysis-form.component';

describe('FanAnalysisFormComponent', () => {
  let component: FanAnalysisFormComponent;
  let fixture: ComponentFixture<FanAnalysisFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanAnalysisFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanAnalysisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
