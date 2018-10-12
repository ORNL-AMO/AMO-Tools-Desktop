import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingReplacementComponent } from './lighting-replacement.component';

describe('LightingReplacementComponent', () => {
  let component: LightingReplacementComponent;
  let fixture: ComponentFixture<LightingReplacementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightingReplacementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingReplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
