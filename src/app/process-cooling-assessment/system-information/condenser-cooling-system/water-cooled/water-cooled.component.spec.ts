import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterCooledComponent } from './water-cooled.component';

describe('WaterCooledComponent', () => {
  let component: WaterCooledComponent;
  let fixture: ComponentFixture<WaterCooledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaterCooledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterCooledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
