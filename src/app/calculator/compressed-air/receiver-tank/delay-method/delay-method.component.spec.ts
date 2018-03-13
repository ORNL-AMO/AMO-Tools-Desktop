import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayMethodComponent } from './delay-method.component';

describe('DelayMethodComponent', () => {
  let component: DelayMethodComponent;
  let fixture: ComponentFixture<DelayMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelayMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
