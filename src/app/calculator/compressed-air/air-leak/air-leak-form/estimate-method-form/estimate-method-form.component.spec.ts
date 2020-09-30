import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateMethodFormComponent } from './estimate-method-form.component';

describe('EstimateMethodFormComponent', () => {
  let component: EstimateMethodFormComponent;
  let fixture: ComponentFixture<EstimateMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstimateMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
