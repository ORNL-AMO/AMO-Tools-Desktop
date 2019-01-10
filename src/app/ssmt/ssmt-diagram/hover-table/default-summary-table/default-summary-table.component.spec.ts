import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultSummaryTableComponent } from './default-summary-table.component';

describe('DefaultSummaryTableComponent', () => {
  let component: DefaultSummaryTableComponent;
  let fixture: ComponentFixture<DefaultSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
