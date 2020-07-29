import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationDataTableComponent } from './operation-data-table.component';

describe('OperationDataTableComponent', () => {
  let component: OperationDataTableComponent;
  let fixture: ComponentFixture<OperationDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
