import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralMethodFormComponent } from './general-method-form.component';

describe('GeneralMethodFormComponent', () => {
  let component: GeneralMethodFormComponent;
  let fixture: ComponentFixture<GeneralMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
