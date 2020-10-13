import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelingOptionsFormComponent } from './modeling-options-form.component';

describe('ModelingOptionsFormComponent', () => {
  let component: ModelingOptionsFormComponent;
  let fixture: ComponentFixture<ModelingOptionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelingOptionsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelingOptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
