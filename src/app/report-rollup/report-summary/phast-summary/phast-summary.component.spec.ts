import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastSummaryComponent } from './phast-summary.component';

describe('PhastSummaryComponent', () => {
  let component: PhastSummaryComponent;
  let fixture: ComponentFixture<PhastSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
