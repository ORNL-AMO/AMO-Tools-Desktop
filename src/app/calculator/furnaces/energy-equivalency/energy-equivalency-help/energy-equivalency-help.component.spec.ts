import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEquivalencyHelpComponent } from './energy-equivalency-help.component';

describe('EnergyEquivalencyHelpComponent', () => {
  let component: EnergyEquivalencyHelpComponent;
  let fixture: ComponentFixture<EnergyEquivalencyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyEquivalencyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEquivalencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
