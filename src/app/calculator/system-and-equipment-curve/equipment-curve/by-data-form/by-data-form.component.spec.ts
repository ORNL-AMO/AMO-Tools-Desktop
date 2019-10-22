import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByDataFormComponent } from './by-data-form.component';

describe('ByDataFormComponent', () => {
  let component: ByDataFormComponent;
  let fixture: ComponentFixture<ByDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
