import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsPhastComponent } from './co2-savings-phast.component';

describe('Co2SavingsPhastComponent', () => {
  let component: Co2SavingsPhastComponent;
  let fixture: ComponentFixture<Co2SavingsPhastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Co2SavingsPhastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2SavingsPhastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
