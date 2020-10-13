import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeTableComponent } from './day-type-table.component';

describe('DayTypeTableComponent', () => {
  let component: DayTypeTableComponent;
  let fixture: ComponentFixture<DayTypeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
