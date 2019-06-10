import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatRollupEnergyTableComponent } from './fsat-rollup-energy-table.component';

describe('FsatRollupEnergyTableComponent', () => {
  let component: FsatRollupEnergyTableComponent;
  let fixture: ComponentFixture<FsatRollupEnergyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatRollupEnergyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatRollupEnergyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
