import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesComponent } from './saturated-properties.component';

describe('SaturatedPropertiesComponent', () => {
  let component: SaturatedPropertiesComponent;
  let fixture: ComponentFixture<SaturatedPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
