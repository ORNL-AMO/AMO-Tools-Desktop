import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterPumpComponent } from './water-pump.component';

describe('WaterPumpComponent', () => {
  let component: WaterPumpComponent;
  let fixture: ComponentFixture<WaterPumpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterPumpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterPumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
