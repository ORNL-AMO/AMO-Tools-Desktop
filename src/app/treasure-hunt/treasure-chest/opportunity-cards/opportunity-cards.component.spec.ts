import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityCardsComponent } from './opportunity-cards.component';

describe('OpportunityCardsComponent', () => {
  let component: OpportunityCardsComponent;
  let fixture: ComponentFixture<OpportunityCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunityCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
