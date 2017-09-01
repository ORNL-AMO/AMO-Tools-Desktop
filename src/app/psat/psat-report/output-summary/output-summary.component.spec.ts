import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputSummaryComponent } from './output-summary.component';

describe('OutputSummaryComponent', () => {
  let component: OutputSummaryComponent;
  let fixture: ComponentFixture<OutputSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutputSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
