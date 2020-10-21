import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AeratorPerformanceDataComponent } from './aerator-performance-data.component';

describe('AeratorPerformanceDataComponent', () => {
  let component: AeratorPerformanceDataComponent;
  let fixture: ComponentFixture<AeratorPerformanceDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AeratorPerformanceDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AeratorPerformanceDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
