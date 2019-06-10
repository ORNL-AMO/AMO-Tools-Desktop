import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatPrintComponent } from './fsat-print.component';

describe('FsatPrintComponent', () => {
  let component: FsatPrintComponent;
  let fixture: ComponentFixture<FsatPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
