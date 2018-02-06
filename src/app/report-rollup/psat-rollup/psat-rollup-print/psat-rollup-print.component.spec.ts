import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatRollupPrintComponent } from './psat-rollup-print.component';

describe('PsatRollupPrintComponent', () => {
  let component: PsatRollupPrintComponent;
  let fixture: ComponentFixture<PsatRollupPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatRollupPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
