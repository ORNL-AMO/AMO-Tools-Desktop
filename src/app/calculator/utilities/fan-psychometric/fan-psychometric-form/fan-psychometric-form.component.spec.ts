import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychometricFormComponent } from './fan-psychometric-form.component';

describe('FanPsychometricFormComponent', () => {
  let component: FanPsychometricFormComponent;
  let fixture: ComponentFixture<FanPsychometricFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychometricFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychometricFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
