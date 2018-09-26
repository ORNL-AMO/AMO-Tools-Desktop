import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensingTurbineFormComponent } from './condensing-turbine-form.component';

describe('CondensingTurbineFormComponent', () => {
  let component: CondensingTurbineFormComponent;
  let fixture: ComponentFixture<CondensingTurbineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CondensingTurbineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensingTurbineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
