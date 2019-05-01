import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityPaybackTableComponent } from './opportunity-payback-table.component';

describe('OpportunityPaybackTableComponent', () => {
  let component: OpportunityPaybackTableComponent;
  let fixture: ComponentFixture<OpportunityPaybackTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunityPaybackTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityPaybackTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
