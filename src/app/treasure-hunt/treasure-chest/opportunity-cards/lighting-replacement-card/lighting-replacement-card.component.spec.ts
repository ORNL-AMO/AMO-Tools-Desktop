import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingReplacementCardComponent } from './lighting-replacement-card.component';

describe('LightingReplacementCardComponent', () => {
  let component: LightingReplacementCardComponent;
  let fixture: ComponentFixture<LightingReplacementCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightingReplacementCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingReplacementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
