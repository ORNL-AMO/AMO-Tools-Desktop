import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceAirLeaksHelpComponent } from './reduce-air-leaks-help.component';

describe('ReduceAirLeaksHelpComponent', () => {
  let component: ReduceAirLeaksHelpComponent;
  let fixture: ComponentFixture<ReduceAirLeaksHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceAirLeaksHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceAirLeaksHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
