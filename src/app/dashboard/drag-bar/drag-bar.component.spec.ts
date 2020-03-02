import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DragBarComponent } from './drag-bar.component';

describe('DragBarComponent', () => {
  let component: DragBarComponent;
  let fixture: ComponentFixture<DragBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
