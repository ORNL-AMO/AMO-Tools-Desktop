import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCardComponent } from './summary-card.component';

describe('SummaryCardComponent', () => {
  let component: SummaryCardComponent;
  let fixture: ComponentFixture<SummaryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
