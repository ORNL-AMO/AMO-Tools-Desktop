import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PneumaticAirFormComponent } from './pneumatic-air-form.component';

describe('PneumaticAirFormComponent', () => {
  let component: PneumaticAirFormComponent;
  let fixture: ComponentFixture<PneumaticAirFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PneumaticAirFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PneumaticAirFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
