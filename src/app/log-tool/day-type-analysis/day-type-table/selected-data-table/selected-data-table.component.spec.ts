import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedDataTableComponent } from './selected-data-table.component';

describe('SelectedDataTableComponent', () => {
  let component: SelectedDataTableComponent;
  let fixture: ComponentFixture<SelectedDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
