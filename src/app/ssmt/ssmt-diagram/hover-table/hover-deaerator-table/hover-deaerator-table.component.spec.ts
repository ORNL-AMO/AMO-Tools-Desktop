import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverDeaeratorTableComponent } from './hover-deaerator-table.component';

describe('HoverDeaeratorTableComponent', () => {
  let component: HoverDeaeratorTableComponent;
  let fixture: ComponentFixture<HoverDeaeratorTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverDeaeratorTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverDeaeratorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
