import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownRateHelpComponent } from './blowdown-rate-help.component';

describe('BlowdownRateHelpComponent', () => {
  let component: BlowdownRateHelpComponent;
  let fixture: ComponentFixture<BlowdownRateHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlowdownRateHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowdownRateHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
