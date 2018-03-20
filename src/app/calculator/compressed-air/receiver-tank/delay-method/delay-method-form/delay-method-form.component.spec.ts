import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayMethodFormComponent } from './delay-method-form.component';

describe('DelayMethodFormComponent', () => {
  let component: DelayMethodFormComponent;
  let fixture: ComponentFixture<DelayMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelayMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
