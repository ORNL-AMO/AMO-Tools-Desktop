import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryFilterComponent } from './summary-filter.component';

describe('SummaryFilterComponent', () => {
  let component: SummaryFilterComponent;
  let fixture: ComponentFixture<SummaryFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
