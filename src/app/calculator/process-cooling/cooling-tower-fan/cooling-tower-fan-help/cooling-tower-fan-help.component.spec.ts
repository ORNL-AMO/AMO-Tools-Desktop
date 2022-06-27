import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerFanHelpComponent } from './cooling-tower-fan-help.component';

describe('CoolingTowerFanHelpComponent', () => {
  let component: CoolingTowerFanHelpComponent;
  let fixture: ComponentFixture<CoolingTowerFanHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerFanHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerFanHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
