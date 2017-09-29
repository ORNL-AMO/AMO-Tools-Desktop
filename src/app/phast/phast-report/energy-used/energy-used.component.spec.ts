import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyUsedComponent } from './energy-used.component';

describe('EnergyUsedComponent', () => {
  let component: EnergyUsedComponent;
  let fixture: ComponentFixture<EnergyUsedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyUsedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
