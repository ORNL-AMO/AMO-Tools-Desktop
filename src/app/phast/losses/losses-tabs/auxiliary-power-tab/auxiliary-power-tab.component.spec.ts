import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxiliaryPowerTabComponent } from './auxiliary-power-tab.component';

describe('AuxiliaryPowerTabComponent', () => {
  let component: AuxiliaryPowerTabComponent;
  let fixture: ComponentFixture<AuxiliaryPowerTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxiliaryPowerTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxiliaryPowerTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
