import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherPropertiesComponent } from './other-properties.component';

describe('OtherPropertiesComponent', () => {
  let component: OtherPropertiesComponent;
  let fixture: ComponentFixture<OtherPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
