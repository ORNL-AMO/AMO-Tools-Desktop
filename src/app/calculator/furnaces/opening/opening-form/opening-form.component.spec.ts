import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningFormComponent } from './opening-form.component';

describe('OpeningFormComponent', () => {
  let component: OpeningFormComponent;
  let fixture: ComponentFixture<OpeningFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpeningFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
