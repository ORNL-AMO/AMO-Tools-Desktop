import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychometricResultsComponent } from './fan-psychometric-results.component';

describe('FanPsychometricResultsComponent', () => {
  let component: FanPsychometricResultsComponent;
  let fixture: ComponentFixture<FanPsychometricResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychometricResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychometricResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
