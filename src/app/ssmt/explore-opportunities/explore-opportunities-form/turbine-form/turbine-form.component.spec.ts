import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineFormComponent } from './turbine-form.component';

describe('TurbineFormComponent', () => {
  let component: TurbineFormComponent;
  let fixture: ComponentFixture<TurbineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
