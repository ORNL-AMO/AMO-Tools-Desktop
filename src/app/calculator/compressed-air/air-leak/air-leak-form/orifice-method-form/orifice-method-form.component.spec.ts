import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrificeMethodFormComponent } from './orifice-method-form.component';

describe('OrificeMethodFormComponent', () => {
  let component: OrificeMethodFormComponent;
  let fixture: ComponentFixture<OrificeMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrificeMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrificeMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
