import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilitySummaryComponent } from './utility-summary.component';

describe('UtilitySummaryComponent', () => {
  let component: UtilitySummaryComponent;
  let fixture: ComponentFixture<UtilitySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilitySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilitySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
