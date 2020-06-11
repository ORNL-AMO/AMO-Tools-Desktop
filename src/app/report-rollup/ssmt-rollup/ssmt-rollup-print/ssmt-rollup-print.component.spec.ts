import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupPrintComponent } from './ssmt-rollup-print.component';

describe('SsmtRollupPrintComponent', () => {
  let component: SsmtRollupPrintComponent;
  let fixture: ComponentFixture<SsmtRollupPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
