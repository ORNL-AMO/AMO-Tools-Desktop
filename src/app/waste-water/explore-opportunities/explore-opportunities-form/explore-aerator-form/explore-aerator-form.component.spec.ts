import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreAeratorFormComponent } from './explore-aerator-form.component';

describe('ExploreAeratorFormComponent', () => {
  let component: ExploreAeratorFormComponent;
  let fixture: ComponentFixture<ExploreAeratorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreAeratorFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreAeratorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
