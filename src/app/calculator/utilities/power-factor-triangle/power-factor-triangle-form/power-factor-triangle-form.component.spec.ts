import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorTriangleFormComponent } from './power-factor-triangle-form.component';

describe('PowerFactorTriangleFormComponent', () => {
  let component: PowerFactorTriangleFormComponent;
  let fixture: ComponentFixture<PowerFactorTriangleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerFactorTriangleFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PowerFactorTriangleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
