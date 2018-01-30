import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreSystemEfficiencyFormComponent } from './explore-system-efficiency-form.component';

describe('ExploreSystemEfficiencyFormComponent', () => {
  let component: ExploreSystemEfficiencyFormComponent;
  let fixture: ComponentFixture<ExploreSystemEfficiencyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreSystemEfficiencyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreSystemEfficiencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
