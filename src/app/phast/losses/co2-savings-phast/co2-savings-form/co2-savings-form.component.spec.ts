import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsFormComponent } from './co2-savings-form.component';

describe('Co2SavingsFormComponent', () => {
  let component: Co2SavingsFormComponent;
  let fixture: ComponentFixture<Co2SavingsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Co2SavingsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2SavingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
