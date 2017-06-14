import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlagComponent } from './slag.component';

describe('SlagComponent', () => {
  let component: SlagComponent;
  let fixture: ComponentFixture<SlagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
