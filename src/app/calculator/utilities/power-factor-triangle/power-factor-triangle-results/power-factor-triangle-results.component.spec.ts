import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorTriangleResultsComponent } from './power-factor-triangle-results.component';

describe('PowerFactorTriangleResultsComponent', () => {
  let component: PowerFactorTriangleResultsComponent;
  let fixture: ComponentFixture<PowerFactorTriangleResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerFactorTriangleResultsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PowerFactorTriangleResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
