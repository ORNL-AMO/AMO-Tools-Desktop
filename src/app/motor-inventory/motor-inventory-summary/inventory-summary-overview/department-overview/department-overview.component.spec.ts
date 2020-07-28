import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentOverviewComponent } from './department-overview.component';

describe('DepartmentOverviewComponent', () => {
  let component: DepartmentOverviewComponent;
  let fixture: ComponentFixture<DepartmentOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
