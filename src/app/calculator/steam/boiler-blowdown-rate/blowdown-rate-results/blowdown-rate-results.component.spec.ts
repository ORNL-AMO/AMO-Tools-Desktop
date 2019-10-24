import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownRateResultsComponent } from './blowdown-rate-results.component';

describe('BlowdownRateResultsComponent', () => {
  let component: BlowdownRateResultsComponent;
  let fixture: ComponentFixture<BlowdownRateResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlowdownRateResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowdownRateResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
