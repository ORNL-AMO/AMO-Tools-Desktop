import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralMethodComponent } from './general-method.component';

describe('GeneralMethodComponent', () => {
  let component: GeneralMethodComponent;
  let fixture: ComponentFixture<GeneralMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
