import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterMotorsComponent } from './filter-motors.component';

describe('FilterMotorsComponent', () => {
  let component: FilterMotorsComponent;
  let fixture: ComponentFixture<FilterMotorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterMotorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterMotorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
