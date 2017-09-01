import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyComponent } from './designed-energy.component';

describe('DesignedEnergyComponent', () => {
  let component: DesignedEnergyComponent;
  let fixture: ComponentFixture<DesignedEnergyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
