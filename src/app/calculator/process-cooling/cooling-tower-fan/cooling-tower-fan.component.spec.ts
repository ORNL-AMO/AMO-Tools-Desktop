import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerFanComponent } from './cooling-tower-fan.component';

describe('CoolingTowerFanComponent', () => {
  let component: CoolingTowerFanComponent;
  let fixture: ComponentFixture<CoolingTowerFanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerFanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerFanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
