import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningTabComponent } from './opening-tab.component';

describe('OpeningTabComponent', () => {
  let component: OpeningTabComponent;
  let fixture: ComponentFixture<OpeningTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpeningTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
