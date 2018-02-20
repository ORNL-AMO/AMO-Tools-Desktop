import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PneumaticAirComponent } from './pneumatic-air.component';

describe('PneumaticAirComponent', () => {
  let component: PneumaticAirComponent;
  let fixture: ComponentFixture<PneumaticAirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PneumaticAirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PneumaticAirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
