import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOperationsFormComponent } from './explore-operations-form.component';

describe('ExploreOperationsFormComponent', () => {
  let component: ExploreOperationsFormComponent;
  let fixture: ComponentFixture<ExploreOperationsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreOperationsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOperationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
