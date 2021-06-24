import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerFanFormComponent } from './cooling-tower-fan-form.component';

describe('CoolingTowerFanFormComponent', () => {
  let component: CoolingTowerFanFormComponent;
  let fixture: ComponentFixture<CoolingTowerFanFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerFanFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerFanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
