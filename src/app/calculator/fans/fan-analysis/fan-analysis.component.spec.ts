import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanAnalysisComponent } from './fan-analysis.component';

describe('FanAnalysisComponent', () => {
  let component: FanAnalysisComponent;
  let fixture: ComponentFixture<FanAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
