import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasDensityComponent } from './gas-density.component';

describe('GasDensityComponent', () => {
  let component: GasDensityComponent;
  let fixture: ComponentFixture<GasDensityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasDensityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasDensityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
