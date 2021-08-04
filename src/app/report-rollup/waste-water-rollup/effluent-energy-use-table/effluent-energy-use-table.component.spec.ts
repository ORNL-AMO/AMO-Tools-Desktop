import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffluentEnergyUseTableComponent } from './effluent-energy-use-table.component';

describe('EffluentEnergyUseTableComponent', () => {
  let component: EffluentEnergyUseTableComponent;
  let fixture: ComponentFixture<EffluentEnergyUseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EffluentEnergyUseTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EffluentEnergyUseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
