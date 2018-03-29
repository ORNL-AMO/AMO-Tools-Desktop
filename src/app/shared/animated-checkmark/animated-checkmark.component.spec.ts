import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedCheckmarkComponent } from './animated-checkmark.component';

describe('AnimatedCheckmarkComponent', () => {
  let component: AnimatedCheckmarkComponent;
  let fixture: ComponentFixture<AnimatedCheckmarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimatedCheckmarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatedCheckmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
