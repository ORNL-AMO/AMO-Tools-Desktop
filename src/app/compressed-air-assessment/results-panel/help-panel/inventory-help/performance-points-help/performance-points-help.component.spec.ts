import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePointsHelpComponent } from './performance-points-help.component';

describe('PerformancePointsHelpComponent', () => {
  let component: PerformancePointsHelpComponent;
  let fixture: ComponentFixture<PerformancePointsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformancePointsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformancePointsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
