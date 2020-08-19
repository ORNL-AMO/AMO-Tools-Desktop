import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationDataHelpComponent } from './operation-data-help.component';

describe('OperationDataHelpComponent', () => {
  let component: OperationDataHelpComponent;
  let fixture: ComponentFixture<OperationDataHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationDataHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
