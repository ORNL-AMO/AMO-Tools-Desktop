import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDataComponent } from './result-data.component';

describe('ResultDataComponent', () => {
  let component: ResultDataComponent;
  let fixture: ComponentFixture<ResultDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
