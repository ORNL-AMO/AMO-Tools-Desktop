import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationCostsComponent } from './operation-costs.component';

describe('OperationCostsComponent', () => {
  let component: OperationCostsComponent;
  let fixture: ComponentFixture<OperationCostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationCostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
