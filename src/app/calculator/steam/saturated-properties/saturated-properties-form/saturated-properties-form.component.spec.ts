import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesFormComponent } from './saturated-properties-form.component';

describe('SaturatedPropertiesFormComponent', () => {
  let component: SaturatedPropertiesFormComponent;
  let fixture: ComponentFixture<SaturatedPropertiesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
