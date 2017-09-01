import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyUseHelpComponent } from './energy-use-help.component';

describe('EnergyUseHelpComponent', () => {
  let component: EnergyUseHelpComponent;
  let fixture: ComponentFixture<EnergyUseHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyUseHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyUseHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
