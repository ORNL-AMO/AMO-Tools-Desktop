import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlagTabComponent } from './slag-tab.component';

describe('SlagTabComponent', () => {
  let component: SlagTabComponent;
  let fixture: ComponentFixture<SlagTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlagTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlagTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
