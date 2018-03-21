import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PneumaticAirHelpComponent } from './pneumatic-air-help.component';

describe('PneumaticAirHelpComponent', () => {
  let component: PneumaticAirHelpComponent;
  let fixture: ComponentFixture<PneumaticAirHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PneumaticAirHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PneumaticAirHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
