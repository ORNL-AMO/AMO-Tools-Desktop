import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMaterialsComponent } from './custom-materials.component';

describe('CustomMaterialsComponent', () => {
  let component: CustomMaterialsComponent;
  let fixture: ComponentFixture<CustomMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
