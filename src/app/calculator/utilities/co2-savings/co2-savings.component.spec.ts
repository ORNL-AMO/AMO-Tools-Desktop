import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsComponent } from './co2-savings.component';

describe('Co2SavingsComponent', () => {
  let component: Co2SavingsComponent;
  let fixture: ComponentFixture<Co2SavingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Co2SavingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2SavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
