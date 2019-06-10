import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturatedPropertiesPhGraphComponent } from './saturated-properties-ph-graph.component';

describe('SaturatedPropertiesPhGraphComponent', () => {
  let component: SaturatedPropertiesPhGraphComponent;
  let fixture: ComponentFixture<SaturatedPropertiesPhGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturatedPropertiesPhGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturatedPropertiesPhGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
