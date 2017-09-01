import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConditionPropertiesComponent } from './edit-condition-properties.component';

describe('EditConditionPropertiesComponent', () => {
  let component: EditConditionPropertiesComponent;
  let fixture: ComponentFixture<EditConditionPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditConditionPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditConditionPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
