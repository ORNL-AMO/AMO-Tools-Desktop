import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirLeakFormComponent } from './air-leak-form.component';

describe('AirLeakFormComponent', () => {
  let component: AirLeakFormComponent;
  let fixture: ComponentFixture<AirLeakFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirLeakFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirLeakFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
