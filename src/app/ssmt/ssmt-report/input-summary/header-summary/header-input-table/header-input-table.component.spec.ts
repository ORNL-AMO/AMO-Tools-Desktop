import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderInputTableComponent } from './header-input-table.component';

describe('HeaderInputTableComponent', () => {
  let component: HeaderInputTableComponent;
  let fixture: ComponentFixture<HeaderInputTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderInputTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderInputTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
