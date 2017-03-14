import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadToolHelpComponent } from './head-tool-help.component';

describe('HeadToolHelpComponent', () => {
  let component: HeadToolHelpComponent;
  let fixture: ComponentFixture<HeadToolHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadToolHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadToolHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
