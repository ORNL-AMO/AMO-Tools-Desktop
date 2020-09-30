import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeGraphComponent } from './day-type-graph.component';

describe('DayTypeGraphComponent', () => {
  let component: DayTypeGraphComponent;
  let fixture: ComponentFixture<DayTypeGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
