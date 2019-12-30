import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorsListComponent } from './motors-list.component';

describe('MotorsListComponent', () => {
  let component: MotorsListComponent;
  let fixture: ComponentFixture<MotorsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
