import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AeratorPerformanceHelpComponent } from './aerator-performance-help.component';

describe('AeratorPerformanceHelpComponent', () => {
  let component: AeratorPerformanceHelpComponent;
  let fixture: ComponentFixture<AeratorPerformanceHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AeratorPerformanceHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AeratorPerformanceHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
