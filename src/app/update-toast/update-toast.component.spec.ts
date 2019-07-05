import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateToastComponent } from './update-toast.component';

describe('UpdateToastComponent', () => {
  let component: UpdateToastComponent;
  let fixture: ComponentFixture<UpdateToastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateToastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
