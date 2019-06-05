import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityPaybackDonutComponent } from './opportunity-payback-donut.component';

describe('OpportunityPaybackDonutComponent', () => {
  let component: OpportunityPaybackDonutComponent;
  let fixture: ComponentFixture<OpportunityPaybackDonutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunityPaybackDonutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityPaybackDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
