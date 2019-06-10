import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatRollupPrintComponent } from './fsat-rollup-print.component';

describe('FsatRollupPrintComponent', () => {
  let component: FsatRollupPrintComponent;
  let fixture: ComponentFixture<FsatRollupPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatRollupPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
