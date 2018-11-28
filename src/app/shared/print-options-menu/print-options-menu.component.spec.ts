import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintOptionsMenuComponent } from './print-options-menu.component';

describe('PrintOptionsMenuComponent', () => {
  let component: PrintOptionsMenuComponent;
  let fixture: ComponentFixture<PrintOptionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintOptionsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintOptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
