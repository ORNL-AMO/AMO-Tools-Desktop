import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingReplacementFormComponent } from './lighting-replacement-form.component';

describe('LightingReplacementFormComponent', () => {
  let component: LightingReplacementFormComponent;
  let fixture: ComponentFixture<LightingReplacementFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightingReplacementFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingReplacementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
