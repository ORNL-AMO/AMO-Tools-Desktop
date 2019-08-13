import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneInfoFormComponent } from './plane-info-form.component';

describe('PlaneInfoFormComponent', () => {
  let component: PlaneInfoFormComponent;
  let fixture: ComponentFixture<PlaneInfoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaneInfoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
