import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSummaryTableComponent } from './team-summary-table.component';

describe('TeamSummaryTableComponent', () => {
  let component: TeamSummaryTableComponent;
  let fixture: ComponentFixture<TeamSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
