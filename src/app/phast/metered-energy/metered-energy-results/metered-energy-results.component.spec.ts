import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredEnergyResultsComponent } from './metered-energy-results.component';

describe('MeteredEnergyResultsComponent', () => {
  let component: MeteredEnergyResultsComponent;
  let fixture: ComponentFixture<MeteredEnergyResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredEnergyResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredEnergyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
