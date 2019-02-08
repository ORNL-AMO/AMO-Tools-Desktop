import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsSummaryComponent } from './operations-summary.component';

describe('OperationsSummaryComponent', () => {
  let component: OperationsSummaryComponent;
  let fixture: ComponentFixture<OperationsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
