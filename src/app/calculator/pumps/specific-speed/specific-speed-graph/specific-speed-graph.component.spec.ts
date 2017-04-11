import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificSpeedGraphComponent } from './specific-speed-graph.component';

describe('SpecificSpeedGraphComponent', () => {
  let component: SpecificSpeedGraphComponent;
  let fixture: ComponentFixture<SpecificSpeedGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificSpeedGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificSpeedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
