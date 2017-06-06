import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxiliaryPowerLossesComponent } from './auxiliary-power-losses.component';

describe('AuxiliaryPowerLossesComponent', () => {
  let component: AuxiliaryPowerLossesComponent;
  let fixture: ComponentFixture<AuxiliaryPowerLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxiliaryPowerLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxiliaryPowerLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
