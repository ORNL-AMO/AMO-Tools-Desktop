import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitySheetHelpComponent } from './opportunity-sheet-help.component';

describe('OpportunitySheetHelpComponent', () => {
  let component: OpportunitySheetHelpComponent;
  let fixture: ComponentFixture<OpportunitySheetHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunitySheetHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitySheetHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
