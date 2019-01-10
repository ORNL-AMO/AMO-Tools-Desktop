import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverHeaderTableComponent } from './hover-header-table.component';

describe('HoverHeaderTableComponent', () => {
  let component: HoverHeaderTableComponent;
  let fixture: ComponentFixture<HoverHeaderTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverHeaderTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverHeaderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
