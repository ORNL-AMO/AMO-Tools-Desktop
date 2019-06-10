import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InletFormComponent } from './inlet-form.component';

describe('InletFormComponent', () => {
  let component: InletFormComponent;
  let fixture: ComponentFixture<InletFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InletFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InletFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
