import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanOperationsSummaryComponent } from './fan-operations-summary.component';

describe('FanOperationsSummaryComponent', () => {
  let component: FanOperationsSummaryComponent;
  let fixture: ComponentFixture<FanOperationsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanOperationsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanOperationsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
