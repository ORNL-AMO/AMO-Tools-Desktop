import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryDashboardMenuComponent } from './directory-dashboard-menu.component';

describe('DirectoryDashboardMenuComponent', () => {
  let component: DirectoryDashboardMenuComponent;
  let fixture: ComponentFixture<DirectoryDashboardMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectoryDashboardMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryDashboardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
