import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceExistingFormComponent } from './replace-existing-form.component';

describe('ReplaceExistingFormComponent', () => {
  let component: ReplaceExistingFormComponent;
  let fixture: ComponentFixture<ReplaceExistingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceExistingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceExistingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
