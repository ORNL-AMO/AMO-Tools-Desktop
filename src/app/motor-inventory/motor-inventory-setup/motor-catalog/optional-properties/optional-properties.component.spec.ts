import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalPropertiesComponent } from './optional-properties.component';

describe('OptionalPropertiesComponent', () => {
  let component: OptionalPropertiesComponent;
  let fixture: ComponentFixture<OptionalPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionalPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionalPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
