import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanInfoFormComponent } from './fan-info-form.component';

describe('FanInfoFormComponent', () => {
  let component: FanInfoFormComponent;
  let fixture: ComponentFixture<FanInfoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanInfoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
