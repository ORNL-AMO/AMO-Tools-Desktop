import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeAnalysisComponent } from './day-type-analysis.component';

describe('DayTypeAnalysisComponent', () => {
  let component: DayTypeAnalysisComponent;
  let fixture: ComponentFixture<DayTypeAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
