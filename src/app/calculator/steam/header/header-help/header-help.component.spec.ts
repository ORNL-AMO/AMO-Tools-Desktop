import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderHelpComponent } from './header-help.component';

describe('HeaderHelpComponent', () => {
  let component: HeaderHelpComponent;
  let fixture: ComponentFixture<HeaderHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
