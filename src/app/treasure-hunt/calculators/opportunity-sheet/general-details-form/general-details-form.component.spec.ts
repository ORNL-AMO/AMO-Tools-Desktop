import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDetailsFormComponent } from './general-details-form.component';

describe('GeneralDetailsFormComponent', () => {
  let component: GeneralDetailsFormComponent;
  let fixture: ComponentFixture<GeneralDetailsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralDetailsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
