import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorTriangleHelpComponent } from './power-factor-triangle-help.component';

describe('PowerFactorTriangleHelpComponent', () => {
  let component: PowerFactorTriangleHelpComponent;
  let fixture: ComponentFixture<PowerFactorTriangleHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerFactorTriangleHelpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PowerFactorTriangleHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
