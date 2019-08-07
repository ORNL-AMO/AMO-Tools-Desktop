import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneDataFormComponent } from './plane-data-form.component';

describe('PlaneDataFormComponent', () => {
  let component: PlaneDataFormComponent;
  let fixture: ComponentFixture<PlaneDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaneDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
