import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XAxisDataComponent } from './x-axis-data.component';

describe('XAxisDataComponent', () => {
  let component: XAxisDataComponent;
  let fixture: ComponentFixture<XAxisDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XAxisDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XAxisDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
