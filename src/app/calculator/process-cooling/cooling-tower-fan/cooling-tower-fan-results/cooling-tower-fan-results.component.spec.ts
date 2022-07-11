import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerFanResultsComponent } from './cooling-tower-fan-results.component';

describe('CoolingTowerFanResultsComponent', () => {
  let component: CoolingTowerFanResultsComponent;
  let fixture: ComponentFixture<CoolingTowerFanResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerFanResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerFanResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
