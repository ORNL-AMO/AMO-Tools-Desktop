import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreByMassFormComponent } from './explore-by-mass-form.component';

describe('ExploreByMassFormComponent', () => {
  let component: ExploreByMassFormComponent;
  let fixture: ComponentFixture<ExploreByMassFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreByMassFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreByMassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
