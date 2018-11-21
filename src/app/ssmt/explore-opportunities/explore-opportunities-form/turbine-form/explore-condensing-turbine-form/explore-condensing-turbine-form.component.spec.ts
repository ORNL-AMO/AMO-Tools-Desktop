import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCondensingTurbineFormComponent } from './explore-condensing-turbine-form.component';

describe('ExploreCondensingTurbineFormComponent', () => {
  let component: ExploreCondensingTurbineFormComponent;
  let fixture: ComponentFixture<ExploreCondensingTurbineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreCondensingTurbineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreCondensingTurbineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
