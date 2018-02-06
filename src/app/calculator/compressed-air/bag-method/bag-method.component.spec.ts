import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BagMethodComponent } from './bag-method.component';

describe('BagMethodComponent', () => {
  let component: BagMethodComponent;
  let fixture: ComponentFixture<BagMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BagMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BagMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
