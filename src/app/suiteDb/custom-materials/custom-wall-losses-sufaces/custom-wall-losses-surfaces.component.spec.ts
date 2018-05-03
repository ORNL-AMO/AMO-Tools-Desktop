import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomWallLossesSurfacesComponent } from './custom-wall-losses-surfaces.component';

describe('CustomWallLossesSufacesComponent', () => {
  let component: CustomWallLossesSurfacesComponent;
  let fixture: ComponentFixture<CustomWallLossesSurfacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomWallLossesSurfacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomWallLossesSurfacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
