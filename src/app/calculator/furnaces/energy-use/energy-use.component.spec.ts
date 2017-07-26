import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyUseComponent } from './energy-use.component';

describe('EnergyUseComponent', () => {
  let component: EnergyUseComponent;
  let fixture: ComponentFixture<EnergyUseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyUseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
