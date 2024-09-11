import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorTriangleComponent } from './power-factor-triangle.component';

describe('PowerFactorTriangleComponent', () => {
  let component: PowerFactorTriangleComponent;
  let fixture: ComponentFixture<PowerFactorTriangleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerFactorTriangleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PowerFactorTriangleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
