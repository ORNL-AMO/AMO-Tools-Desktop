import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasDensityFormComponent } from './gas-density-form.component';

describe('GasDensityFormComponent', () => {
  let component: GasDensityFormComponent;
  let fixture: ComponentFixture<GasDensityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasDensityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasDensityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
