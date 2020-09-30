import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogToolBannerComponent } from './log-tool-banner.component';

describe('LogToolBannerComponent', () => {
  let component: LogToolBannerComponent;
  let fixture: ComponentFixture<LogToolBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogToolBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogToolBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
