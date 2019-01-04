import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverCondensateTableComponent } from './hover-condensate-table.component';

describe('HoverCondensateTableComponent', () => {
  let component: HoverCondensateTableComponent;
  let fixture: ComponentFixture<HoverCondensateTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverCondensateTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverCondensateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
