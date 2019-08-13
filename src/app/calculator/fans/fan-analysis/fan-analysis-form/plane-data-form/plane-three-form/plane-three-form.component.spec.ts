import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneThreeFormComponent } from './plane-three-form.component';

describe('PlaneThreeFormComponent', () => {
  let component: PlaneThreeFormComponent;
  let fixture: ComponentFixture<PlaneThreeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaneThreeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneThreeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
