import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AeratorPerformanceFormComponent } from './aerator-performance-form.component';

describe('AeratorPerformanceFormComponent', () => {
  let component: AeratorPerformanceFormComponent;
  let fixture: ComponentFixture<AeratorPerformanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AeratorPerformanceFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AeratorPerformanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
