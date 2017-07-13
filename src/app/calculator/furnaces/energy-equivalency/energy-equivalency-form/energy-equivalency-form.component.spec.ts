import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEquivalencyFormComponent } from './energy-equivalency-form.component';

describe('EnergyEquivalencyFormComponent', () => {
  let component: EnergyEquivalencyFormComponent;
  let fixture: ComponentFixture<EnergyEquivalencyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyEquivalencyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEquivalencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
