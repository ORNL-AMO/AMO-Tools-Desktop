import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BagMethodFormComponent } from './bag-method-form.component';

describe('BagMethodFormComponent', () => {
  let component: BagMethodFormComponent;
  let fixture: ComponentFixture<BagMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BagMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BagMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
