import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupEnergyTableComponent } from './phast-rollup-energy-table.component';

describe('PhastRollupEnergyTableComponent', () => {
  let component: PhastRollupEnergyTableComponent;
  let fixture: ComponentFixture<PhastRollupEnergyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupEnergyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupEnergyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
