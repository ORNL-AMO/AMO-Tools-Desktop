import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowHelpComponent } from './cash-flow-help.component';

describe('CashFlowHelpComponent', () => {
  let component: CashFlowHelpComponent;
  let fixture: ComponentFixture<CashFlowHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashFlowHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
