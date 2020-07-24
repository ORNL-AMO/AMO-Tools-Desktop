import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsDataComponent } from './operations-data.component';

describe('OperationsDataComponent', () => {
  let component: OperationsDataComponent;
  let fixture: ComponentFixture<OperationsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
