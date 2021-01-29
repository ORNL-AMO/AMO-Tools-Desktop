import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInventoryBannerComponent } from './motor-inventory-banner.component';

describe('MotorInventoryBannerComponent', () => {
  let component: MotorInventoryBannerComponent;
  let fixture: ComponentFixture<MotorInventoryBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorInventoryBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorInventoryBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
