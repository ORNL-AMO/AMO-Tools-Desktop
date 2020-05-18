import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecibelMethodFormComponent } from './decibel-method-form.component';

describe('DecibelMethodFormComponent', () => {
  let component: DecibelMethodFormComponent;
  let fixture: ComponentFixture<DecibelMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecibelMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecibelMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
