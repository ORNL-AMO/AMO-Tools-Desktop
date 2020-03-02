import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryDashboardComponent } from './directory-dashboard.component';

describe('DirectoryDashboardComponent', () => {
  let component: DirectoryDashboardComponent;
  let fixture: ComponentFixture<DirectoryDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectoryDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
