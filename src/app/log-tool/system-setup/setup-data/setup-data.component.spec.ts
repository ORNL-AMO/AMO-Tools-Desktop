import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupDataComponent } from './setup-data.component';

describe('SetupDataComponent', () => {
  let component: SetupDataComponent;
  let fixture: ComponentFixture<SetupDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
