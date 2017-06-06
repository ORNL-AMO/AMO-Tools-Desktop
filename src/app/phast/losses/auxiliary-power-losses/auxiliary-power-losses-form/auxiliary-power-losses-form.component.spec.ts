import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxiliaryPowerLossesFormComponent } from './auxiliary-power-losses-form.component';

describe('AuxiliaryPowerLossesFormComponent', () => {
  let component: AuxiliaryPowerLossesFormComponent;
  let fixture: ComponentFixture<AuxiliaryPowerLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxiliaryPowerLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxiliaryPowerLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
