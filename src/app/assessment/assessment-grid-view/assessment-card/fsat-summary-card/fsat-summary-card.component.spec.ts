import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatSummaryCardComponent } from './fsat-summary-card.component';

describe('FsatSummaryCardComponent', () => {
  let component: FsatSummaryCardComponent;
  let fixture: ComponentFixture<FsatSummaryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatSummaryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
