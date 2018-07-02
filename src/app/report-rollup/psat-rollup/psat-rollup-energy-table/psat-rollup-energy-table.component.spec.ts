import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatRollupEnergyTableComponent } from './psat-rollup-energy-table.component';

describe('PsatRollupEnergyTableComponent', () => {
  let component: PsatRollupEnergyTableComponent;
  let fixture: ComponentFixture<PsatRollupEnergyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatRollupEnergyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatRollupEnergyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
