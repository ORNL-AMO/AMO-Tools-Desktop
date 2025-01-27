import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePointsPropertiesComponent } from './performance-points-properties.component';

describe('PerformancePointsPropertiesComponent', () => {
  let component: PerformancePointsPropertiesComponent;
  let fixture: ComponentFixture<PerformancePointsPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformancePointsPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformancePointsPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
