import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpSummaryComponent } from './pump-summary.component';

describe('PumpSummaryComponent', () => {
  let component: PumpSummaryComponent;
  let fixture: ComponentFixture<PumpSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PumpSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
