import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerWaterComponent } from './boiler-water.component';

describe('BoilerWaterComponent', () => {
  let component: BoilerWaterComponent;
  let fixture: ComponentFixture<BoilerWaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoilerWaterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoilerWaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
