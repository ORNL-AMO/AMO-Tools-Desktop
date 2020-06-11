import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychometricHelpComponent } from './fan-psychometric-help.component';

describe('FanPsychometricHelpComponent', () => {
  let component: FanPsychometricHelpComponent;
  let fixture: ComponentFixture<FanPsychometricHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychometricHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychometricHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
