import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalDimensionModalComponent } from './internal-dimension-modal.component';

describe('InternalDimensionModalComponent', () => {
  let component: InternalDimensionModalComponent;
  let fixture: ComponentFixture<InternalDimensionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalDimensionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalDimensionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
