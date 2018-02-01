import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatSummaryComponent } from './psat-summary.component';

describe('PsatSummaryComponent', () => {
  let component: PsatSummaryComponent;
  let fixture: ComponentFixture<PsatSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
