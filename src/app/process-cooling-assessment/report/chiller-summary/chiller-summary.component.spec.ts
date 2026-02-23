import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerSummaryComponent } from './chiller-summary.component';

describe('ChillerSummaryComponent', () => {
  let component: ChillerSummaryComponent;
  let fixture: ComponentFixture<ChillerSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChillerSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChillerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
