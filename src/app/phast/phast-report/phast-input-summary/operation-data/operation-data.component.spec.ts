import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationDataComponent } from './operation-data.component';

describe('OperationDataComponent', () => {
  let component: OperationDataComponent;
  let fixture: ComponentFixture<OperationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
