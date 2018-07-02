import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreWallFormComponent } from './explore-wall-form.component';

describe('ExploreWallFormComponent', () => {
  let component: ExploreWallFormComponent;
  let fixture: ComponentFixture<ExploreWallFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreWallFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreWallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
