import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceAirLeaksComponent } from './reduce-air-leaks.component';

describe('ReduceAirLeaksComponent', () => {
  let component: ReduceAirLeaksComponent;
  let fixture: ComponentFixture<ReduceAirLeaksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceAirLeaksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceAirLeaksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
