import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandaloneOpportunitySheetComponent } from './standalone-opportunity-sheet.component';

describe('StandaloneOpportunitySheetComponent', () => {
  let component: StandaloneOpportunitySheetComponent;
  let fixture: ComponentFixture<StandaloneOpportunitySheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandaloneOpportunitySheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandaloneOpportunitySheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
