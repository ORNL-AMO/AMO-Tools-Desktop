import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualSpecificationPropertiesComponent } from './manual-specification-properties.component';

describe('ManualSpecificationPropertiesComponent', () => {
  let component: ManualSpecificationPropertiesComponent;
  let fixture: ComponentFixture<ManualSpecificationPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualSpecificationPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualSpecificationPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
