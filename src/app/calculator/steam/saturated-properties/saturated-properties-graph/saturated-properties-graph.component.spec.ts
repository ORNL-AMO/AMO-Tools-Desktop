import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesGraphComponent } from './saturated-properties-graph.component';

describe('SaturatedPropertiesGraphComponent', () => {
  let component: SaturatedPropertiesGraphComponent;
  let fixture: ComponentFixture<SaturatedPropertiesGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
