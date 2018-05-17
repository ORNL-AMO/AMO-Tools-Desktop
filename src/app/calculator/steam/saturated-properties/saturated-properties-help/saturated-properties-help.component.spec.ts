import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesHelpComponent } from './saturated-properties-help.component';

describe('SaturatedPropertiesHelpComponent', () => {
  let component: SaturatedPropertiesHelpComponent;
  let fixture: ComponentFixture<SaturatedPropertiesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
