import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEquivalencyComponent } from './energy-equivalency.component';

describe('EnergyEquivalencyComponent', () => {
  let component: EnergyEquivalencyComponent;
  let fixture: ComponentFixture<EnergyEquivalencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyEquivalencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEquivalencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
