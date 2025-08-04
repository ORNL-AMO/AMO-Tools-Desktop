import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterPumpHelpComponent } from './water-pump-help.component';

describe('WaterPumpHelpComponent', () => {
  let component: WaterPumpHelpComponent;
  let fixture: ComponentFixture<WaterPumpHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterPumpHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterPumpHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
