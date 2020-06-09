import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychometricComponent } from './fan-psychometric.component';

describe('FanPsychometricComponent', () => {
  let component: FanPsychometricComponent;
  let fixture: ComponentFixture<FanPsychometricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychometricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychometricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
