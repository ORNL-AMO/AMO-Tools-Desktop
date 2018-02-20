import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupPrintComponent } from './phast-rollup-print.component';

describe('PhastRollupPrintComponent', () => {
  let component: PhastRollupPrintComponent;
  let fixture: ComponentFixture<PhastRollupPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
