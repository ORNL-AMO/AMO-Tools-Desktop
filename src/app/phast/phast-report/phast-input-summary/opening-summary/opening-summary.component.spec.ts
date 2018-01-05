import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningSummaryComponent } from './opening-summary.component';

describe('OpeningSummaryComponent', () => {
  let component: OpeningSummaryComponent;
  let fixture: ComponentFixture<OpeningSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpeningSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
