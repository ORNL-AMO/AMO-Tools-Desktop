import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverTableComponent } from './hover-table.component';

describe('HoverTableComponent', () => {
  let component: HoverTableComponent;
  let fixture: ComponentFixture<HoverTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
