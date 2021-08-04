import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirHeatingResultsComponent } from './air-heating-results.component';

describe('AirHeatingResultsComponent', () => {
  let component: AirHeatingResultsComponent;
  let fixture: ComponentFixture<AirHeatingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirHeatingResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirHeatingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
