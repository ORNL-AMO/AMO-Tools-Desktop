import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherSummaryComponent } from './other-summary.component';

describe('OtherSummaryComponent', () => {
  let component: OtherSummaryComponent;
  let fixture: ComponentFixture<OtherSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
