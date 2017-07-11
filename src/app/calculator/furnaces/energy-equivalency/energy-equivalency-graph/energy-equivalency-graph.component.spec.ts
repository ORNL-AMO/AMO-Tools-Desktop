import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEquivalencyGraphComponent } from './energy-equivalency-graph.component';

describe('EnergyEquivalencyGraphComponent', () => {
  let component: EnergyEquivalencyGraphComponent;
  let fixture: ComponentFixture<EnergyEquivalencyGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyEquivalencyGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEquivalencyGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
