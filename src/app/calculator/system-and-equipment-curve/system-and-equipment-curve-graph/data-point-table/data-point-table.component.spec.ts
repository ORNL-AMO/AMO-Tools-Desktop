import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPointTableComponent } from './data-point-table.component';

describe('DataPointTableComponent', () => {
  let component: DataPointTableComponent;
  let fixture: ComponentFixture<DataPointTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataPointTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPointTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
