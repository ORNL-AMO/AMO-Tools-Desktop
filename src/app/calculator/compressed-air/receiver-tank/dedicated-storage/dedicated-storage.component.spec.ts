import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicatedStorageComponent } from './dedicated-storage.component';

describe('DedicatedStorageComponent', () => {
  let component: DedicatedStorageComponent;
  let fixture: ComponentFixture<DedicatedStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DedicatedStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DedicatedStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
