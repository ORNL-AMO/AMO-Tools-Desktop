import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceProfileGraphComponent } from './performance-profile-graph.component';

describe('PerformanceProfileGraphComponent', () => {
  let component: PerformanceProfileGraphComponent;
  let fixture: ComponentFixture<PerformanceProfileGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformanceProfileGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceProfileGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
