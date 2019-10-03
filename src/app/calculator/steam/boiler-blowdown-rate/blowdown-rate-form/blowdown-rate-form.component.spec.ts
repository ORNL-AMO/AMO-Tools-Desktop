import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownRateFormComponent } from './blowdown-rate-form.component';

describe('BlowdownRateFormComponent', () => {
  let component: BlowdownRateFormComponent;
  let fixture: ComponentFixture<BlowdownRateFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlowdownRateFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowdownRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
