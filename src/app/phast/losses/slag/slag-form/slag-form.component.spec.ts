import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlagFormComponent } from './slag-form.component';

describe('SlagFormComponent', () => {
  let component: SlagFormComponent;
  let fixture: ComponentFixture<SlagFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlagFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
