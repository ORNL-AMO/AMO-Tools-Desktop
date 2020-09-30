import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationDataPropertiesComponent } from './operation-data-properties.component';

describe('OperationDataPropertiesComponent', () => {
  let component: OperationDataPropertiesComponent;
  let fixture: ComponentFixture<OperationDataPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationDataPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationDataPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
