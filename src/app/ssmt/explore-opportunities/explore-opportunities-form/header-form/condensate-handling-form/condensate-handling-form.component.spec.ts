import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensateHandlingFormComponent } from './condensate-handling-form.component';

describe('CondensateHandlingFormComponent', () => {
  let component: CondensateHandlingFormComponent;
  let fixture: ComponentFixture<CondensateHandlingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CondensateHandlingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensateHandlingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
