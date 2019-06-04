import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupEnergyTableComponent } from './ssmt-rollup-energy-table.component';

describe('SsmtRollupEnergyTableComponent', () => {
  let component: SsmtRollupEnergyTableComponent;
  let fixture: ComponentFixture<SsmtRollupEnergyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupEnergyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupEnergyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
