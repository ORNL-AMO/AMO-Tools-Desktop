import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasDensityResultsComponent } from './gas-density-results.component';

describe('GasDensityResultsComponent', () => {
  let component: GasDensityResultsComponent;
  let fixture: ComponentFixture<GasDensityResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasDensityResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasDensityResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
