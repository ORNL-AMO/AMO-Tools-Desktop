import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeSummaryComponent } from './day-type-summary.component';

describe('DayTypeSummaryComponent', () => {
  let component: DayTypeSummaryComponent;
  let fixture: ComponentFixture<DayTypeSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
