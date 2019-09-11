import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitySheetComponent } from './opportunity-sheet.component';

describe('OpportunitySheetComponent', () => {
  let component: OpportunitySheetComponent;
  let fixture: ComponentFixture<OpportunitySheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunitySheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitySheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
