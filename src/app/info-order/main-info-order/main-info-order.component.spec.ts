import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainInfoOrderComponent } from './main-info-order.component';

describe('MainInfoOrderComponent', () => {
  let component: MainInfoOrderComponent;
  let fixture: ComponentFixture<MainInfoOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainInfoOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainInfoOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
