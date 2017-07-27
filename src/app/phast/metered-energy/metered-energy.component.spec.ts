import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredEnergyComponent } from './metered-energy.component';

describe('MeteredEnergyComponent', () => {
  let component: MeteredEnergyComponent;
  let fixture: ComponentFixture<MeteredEnergyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredEnergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
