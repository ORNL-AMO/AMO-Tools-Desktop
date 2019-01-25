import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverPrvTableComponent } from './hover-prv-table.component';

describe('HoverPrvTableComponent', () => {
  let component: HoverPrvTableComponent;
  let fixture: ComponentFixture<HoverPrvTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverPrvTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverPrvTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
