import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoLoadComponent } from './no-load.component';

describe('NoLoadComponent', () => {
  let component: NoLoadComponent;
  let fixture: ComponentFixture<NoLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoLoadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
