import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredPropertiesComponent } from './required-properties.component';

describe('RequiredPropertiesComponent', () => {
  let component: RequiredPropertiesComponent;
  let fixture: ComponentFixture<RequiredPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequiredPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequiredPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
