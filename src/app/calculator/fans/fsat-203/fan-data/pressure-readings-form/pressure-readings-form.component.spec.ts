import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PressureReadingsFormComponent } from './pressure-readings-form.component';

describe('PressureReadingsFormComponent', () => {
  let component: PressureReadingsFormComponent;
  let fixture: ComponentFixture<PressureReadingsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PressureReadingsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PressureReadingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
