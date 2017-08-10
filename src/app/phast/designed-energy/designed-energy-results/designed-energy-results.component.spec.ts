import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyResultsComponent } from './designed-energy-results.component';

describe('DesignedEnergyResultsComponent', () => {
  let component: DesignedEnergyResultsComponent;
  let fixture: ComponentFixture<DesignedEnergyResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
