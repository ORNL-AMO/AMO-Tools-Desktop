import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingReplacementHelpComponent } from './lighting-replacement-help.component';

describe('LightingReplacementHelpComponent', () => {
  let component: LightingReplacementHelpComponent;
  let fixture: ComponentFixture<LightingReplacementHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightingReplacementHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingReplacementHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
