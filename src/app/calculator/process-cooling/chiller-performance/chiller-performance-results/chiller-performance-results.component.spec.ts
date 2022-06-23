import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerPerformanceResultsComponent } from './chiller-performance-results.component';

describe('ChillerPerformanceResultsComponent', () => {
  let component: ChillerPerformanceResultsComponent;
  let fixture: ComponentFixture<ChillerPerformanceResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerPerformanceResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerPerformanceResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
