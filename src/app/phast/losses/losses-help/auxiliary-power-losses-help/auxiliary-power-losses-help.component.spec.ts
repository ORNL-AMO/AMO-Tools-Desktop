import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxiliaryPowerLossesHelpComponent } from './auxiliary-power-losses-help.component';

describe('AuxiliaryPowerLossesHelpComponent', () => {
  let component: AuxiliaryPowerLossesHelpComponent;
  let fixture: ComponentFixture<AuxiliaryPowerLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxiliaryPowerLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxiliaryPowerLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
