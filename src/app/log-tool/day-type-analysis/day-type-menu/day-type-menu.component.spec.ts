import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeMenuComponent } from './day-type-menu.component';

describe('DayTypeMenuComponent', () => {
  let component: DayTypeMenuComponent;
  let fixture: ComponentFixture<DayTypeMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
