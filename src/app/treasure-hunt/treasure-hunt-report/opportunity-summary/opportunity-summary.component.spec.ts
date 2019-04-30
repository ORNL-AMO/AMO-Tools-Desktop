import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitySummaryComponent } from './opportunity-summary.component';

describe('OpportunitySummaryComponent', () => {
  let component: OpportunitySummaryComponent;
  let fixture: ComponentFixture<OpportunitySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunitySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
