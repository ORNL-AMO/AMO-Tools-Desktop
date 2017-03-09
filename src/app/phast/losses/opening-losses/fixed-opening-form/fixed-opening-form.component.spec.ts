import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedOpeningFormComponent } from './fixed-opening-form.component';

describe('FixedOpeningFormComponent', () => {
  let component: FixedOpeningFormComponent;
  let fixture: ComponentFixture<FixedOpeningFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedOpeningFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedOpeningFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
