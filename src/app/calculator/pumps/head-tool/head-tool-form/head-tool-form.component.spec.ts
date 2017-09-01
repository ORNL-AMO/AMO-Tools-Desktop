import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadToolFormComponent } from './head-tool-form.component';

describe('HeadToolFormComponent', () => {
  let component: HeadToolFormComponent;
  let fixture: ComponentFixture<HeadToolFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadToolFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadToolFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
