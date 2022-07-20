import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetupFormComponent } from './data-setup-form.component';

describe('DataSetupFormComponent', () => {
  let component: DataSetupFormComponent;
  let fixture: ComponentFixture<DataSetupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSetupFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
