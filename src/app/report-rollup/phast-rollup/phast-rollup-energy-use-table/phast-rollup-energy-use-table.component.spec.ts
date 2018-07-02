import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupEnergyUseTableComponent } from './phast-rollup-energy-use-table.component';

describe('PhastRollupEnergyUseTableComponent', () => {
  let component: PhastRollupEnergyUseTableComponent;
  let fixture: ComponentFixture<PhastRollupEnergyUseTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupEnergyUseTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupEnergyUseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
