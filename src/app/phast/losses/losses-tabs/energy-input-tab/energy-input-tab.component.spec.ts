import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputTabComponent } from './energy-input-tab.component';

describe('EnergyInputTabComponent', () => {
  let component: EnergyInputTabComponent;
  let fixture: ComponentFixture<EnergyInputTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
