import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDataSetComponent } from './add-data-set.component';

describe('AddDataSetComponent', () => {
  let component: AddDataSetComponent;
  let fixture: ComponentFixture<AddDataSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDataSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDataSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
