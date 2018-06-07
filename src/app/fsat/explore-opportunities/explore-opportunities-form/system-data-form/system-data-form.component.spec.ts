import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemDataFormComponent } from './system-data-form.component';

describe('SystemDataFormComponent', () => {
  let component: SystemDataFormComponent;
  let fixture: ComponentFixture<SystemDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
