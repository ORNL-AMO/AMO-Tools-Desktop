import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsResultsComponent } from './co2-savings-results.component';

describe('Co2SavingsResultsComponent', () => {
  let component: Co2SavingsResultsComponent;
  let fixture: ComponentFixture<Co2SavingsResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Co2SavingsResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2SavingsResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
