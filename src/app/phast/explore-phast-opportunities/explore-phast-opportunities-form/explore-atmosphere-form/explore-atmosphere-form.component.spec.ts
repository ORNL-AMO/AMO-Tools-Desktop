import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreAtmosphereFormComponent } from './explore-atmosphere-form.component';

describe('ExploreAtmosphereFormComponent', () => {
  let component: ExploreAtmosphereFormComponent;
  let fixture: ComponentFixture<ExploreAtmosphereFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreAtmosphereFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreAtmosphereFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
