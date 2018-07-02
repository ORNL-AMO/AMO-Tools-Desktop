import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeSizingFormComponent } from './pipe-sizing-form.component';

describe('PipeSizingFormComponent', () => {
  let component: PipeSizingFormComponent;
  let fixture: ComponentFixture<PipeSizingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipeSizingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeSizingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
