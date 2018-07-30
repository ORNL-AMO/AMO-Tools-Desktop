import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaeratorFormComponent } from './deaerator-form.component';

describe('DeaeratorFormComponent', () => {
  let component: DeaeratorFormComponent;
  let fixture: ComponentFixture<DeaeratorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeaeratorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeaeratorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
