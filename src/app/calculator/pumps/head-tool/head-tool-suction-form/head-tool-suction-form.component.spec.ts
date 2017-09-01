import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadToolSuctionFormComponent } from './head-tool-suction-form.component';

describe('HeadToolSuctionFormComponent', () => {
  let component: HeadToolSuctionFormComponent;
  let fixture: ComponentFixture<HeadToolSuctionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadToolSuctionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadToolSuctionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
