import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitySheetCardComponent } from './opportunity-sheet-card.component';

describe('OpportunitySheetCardComponent', () => {
  let component: OpportunitySheetCardComponent;
  let fixture: ComponentFixture<OpportunitySheetCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunitySheetCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitySheetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
