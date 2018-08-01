import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderResultsComponent } from './header-results.component';

describe('HeaderResultsComponent', () => {
  let component: HeaderResultsComponent;
  let fixture: ComponentFixture<HeaderResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
