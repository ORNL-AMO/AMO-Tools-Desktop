import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidPhastComponent } from './invalid-phast.component';

describe('InvalidPhastComponent', () => {
  let component: InvalidPhastComponent;
  let fixture: ComponentFixture<InvalidPhastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvalidPhastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidPhastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
