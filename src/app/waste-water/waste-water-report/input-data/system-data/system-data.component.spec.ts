import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemDataComponent } from './system-data.component';

describe('SystemDataComponent', () => {
  let component: SystemDataComponent;
  let fixture: ComponentFixture<SystemDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
