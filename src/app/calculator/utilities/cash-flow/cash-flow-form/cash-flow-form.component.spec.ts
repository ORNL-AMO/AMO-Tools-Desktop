import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowFormComponent } from './cash-flow-form.component';

describe('CashFlowFormComponent', () => {
  let component: CashFlowFormComponent;
  let fixture: ComponentFixture<CashFlowFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashFlowFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
