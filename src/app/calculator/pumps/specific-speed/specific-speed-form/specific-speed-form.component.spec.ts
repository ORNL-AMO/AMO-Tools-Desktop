import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificSpeedFormComponent } from './specific-speed-form.component';

describe('SpecificSpeedFormComponent', () => {
  let component: SpecificSpeedFormComponent;
  let fixture: ComponentFixture<SpecificSpeedFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificSpeedFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificSpeedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
