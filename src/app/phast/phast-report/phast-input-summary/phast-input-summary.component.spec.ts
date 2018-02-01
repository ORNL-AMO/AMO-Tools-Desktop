import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastInputSummaryComponent } from './phast-input-summary.component';

describe('PhastInputSummaryComponent', () => {
  let component: PhastInputSummaryComponent;
  let fixture: ComponentFixture<PhastInputSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastInputSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastInputSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
