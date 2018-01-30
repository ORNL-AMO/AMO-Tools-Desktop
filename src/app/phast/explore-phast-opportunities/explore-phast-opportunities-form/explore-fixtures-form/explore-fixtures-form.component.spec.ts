import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreFixturesFormComponent } from './explore-fixtures-form.component';

describe('ExploreFixturesFormComponent', () => {
  let component: ExploreFixturesFormComponent;
  let fixture: ComponentFixture<ExploreFixturesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreFixturesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreFixturesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
