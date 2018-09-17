import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportableTableComponent } from './exportable-table.component';

describe('ExportableTableComponent', () => {
  let component: ExportableTableComponent;
  let fixture: ComponentFixture<ExportableTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportableTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
