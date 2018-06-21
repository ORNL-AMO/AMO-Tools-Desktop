import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyFieldDataFormComponent } from './modify-field-data-form.component';

describe('ModifyFieldDataFormComponent', () => {
  let component: ModifyFieldDataFormComponent;
  let fixture: ComponentFixture<ModifyFieldDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyFieldDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyFieldDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
