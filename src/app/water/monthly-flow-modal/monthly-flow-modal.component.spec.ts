import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyFlowModalComponent } from './monthly-flow-modal.component';

describe('MonthlyFlowModalComponent', () => {
  let component: MonthlyFlowModalComponent;
  let fixture: ComponentFixture<MonthlyFlowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyFlowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyFlowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
