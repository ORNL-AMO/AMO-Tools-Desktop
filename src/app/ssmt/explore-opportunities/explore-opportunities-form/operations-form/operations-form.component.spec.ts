import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsFormComponent } from './operations-form.component';

describe('OperationsFormComponent', () => {
  let component: OperationsFormComponent;
  let fixture: ComponentFixture<OperationsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
