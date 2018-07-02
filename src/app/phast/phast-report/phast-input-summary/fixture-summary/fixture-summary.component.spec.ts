import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureSummaryComponent } from './fixture-summary.component';

describe('FixtureSummaryComponent', () => {
  let component: FixtureSummaryComponent;
  let fixture: ComponentFixture<FixtureSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
