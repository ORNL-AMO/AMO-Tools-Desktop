import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaeratorTableComponent } from './deaerator-table.component';

describe('DeaeratorTableComponent', () => {
  let component: DeaeratorTableComponent;
  let fixture: ComponentFixture<DeaeratorTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeaeratorTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeaeratorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
