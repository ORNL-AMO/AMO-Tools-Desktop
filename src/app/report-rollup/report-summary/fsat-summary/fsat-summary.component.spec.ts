import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatSummaryComponent } from './fsat-summary.component';

describe('FsatSummaryComponent', () => {
  let component: FsatSummaryComponent;
  let fixture: ComponentFixture<FsatSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
