import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldDataSummaryComponent } from './field-data-summary.component';

describe('FieldDataSummaryComponent', () => {
  let component: FieldDataSummaryComponent;
  let fixture: ComponentFixture<FieldDataSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldDataSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldDataSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
