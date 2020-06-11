import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogToolComponent } from './log-tool.component';

describe('LogToolComponent', () => {
  let component: LogToolComponent;
  let fixture: ComponentFixture<LogToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
