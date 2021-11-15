import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaybackPeriodComponent } from './payback-period.component';

describe('PaybackPeriodComponent', () => {
  let component: PaybackPeriodComponent;
  let fixture: ComponentFixture<PaybackPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaybackPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaybackPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
