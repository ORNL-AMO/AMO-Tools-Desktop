import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownRateModalComponent } from './blowdown-rate-modal.component';

describe('BlowdownRateModalComponent', () => {
  let component: BlowdownRateModalComponent;
  let fixture: ComponentFixture<BlowdownRateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlowdownRateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowdownRateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
