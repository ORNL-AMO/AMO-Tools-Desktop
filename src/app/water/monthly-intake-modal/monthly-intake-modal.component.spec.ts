import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyIntakeModalComponent } from './monthly-intake-modal.component';

describe('MonthlyIntakeModalComponent', () => {
  let component: MonthlyIntakeModalComponent;
  let fixture: ComponentFixture<MonthlyIntakeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyIntakeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyIntakeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
