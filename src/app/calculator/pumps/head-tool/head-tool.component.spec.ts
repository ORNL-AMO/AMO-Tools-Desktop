import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadToolComponent } from './head-tool.component';

describe('HeadToolComponent', () => {
  let component: HeadToolComponent;
  let fixture: ComponentFixture<HeadToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
