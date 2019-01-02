import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverBoilerTableComponent } from './hover-boiler-table.component';

describe('HoverBoilerTableComponent', () => {
  let component: HoverBoilerTableComponent;
  let fixture: ComponentFixture<HoverBoilerTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverBoilerTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverBoilerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
