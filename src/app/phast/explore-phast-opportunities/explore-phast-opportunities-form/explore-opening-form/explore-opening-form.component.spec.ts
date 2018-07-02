import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpeningFormComponent } from './explore-opening-form.component';

describe('ExploreOpeningFormComponent', () => {
  let component: ExploreOpeningFormComponent;
  let fixture: ComponentFixture<ExploreOpeningFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreOpeningFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpeningFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
