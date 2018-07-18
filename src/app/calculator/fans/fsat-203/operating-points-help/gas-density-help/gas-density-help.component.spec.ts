import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasDensityHelpComponent } from './gas-density-help.component';

describe('GasDensityHelpComponent', () => {
  let component: GasDensityHelpComponent;
  let fixture: ComponentFixture<GasDensityHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasDensityHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasDensityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
