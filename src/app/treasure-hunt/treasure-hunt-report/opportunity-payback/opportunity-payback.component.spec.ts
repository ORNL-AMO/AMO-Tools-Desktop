import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityPaybackComponent } from './opportunity-payback.component';

describe('OpportunityPaybackComponent', () => {
  let component: OpportunityPaybackComponent;
  let fixture: ComponentFixture<OpportunityPaybackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunityPaybackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityPaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
