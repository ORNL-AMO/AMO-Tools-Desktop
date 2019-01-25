import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverTurbineTableComponent } from './hover-turbine-table.component';

describe('HoverTurbineTableComponent', () => {
  let component: HoverTurbineTableComponent;
  let fixture: ComponentFixture<HoverTurbineTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverTurbineTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverTurbineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
