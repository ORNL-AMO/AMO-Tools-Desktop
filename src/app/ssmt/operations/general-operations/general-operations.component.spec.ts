import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralOperationsComponent } from './general-operations.component';

describe('GeneralOperationsComponent', () => {
  let component: GeneralOperationsComponent;
  let fixture: ComponentFixture<GeneralOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
