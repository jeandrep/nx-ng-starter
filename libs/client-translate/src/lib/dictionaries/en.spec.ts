import { async, TestBed } from '@angular/core/testing';

import { IUiDictionary } from '../interfaces';
import { EN, EN_DICTIONARY } from './en';

describe('English shared translations', () => {
  let dictionary: IUiDictionary;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      providers: [
        {
          provide: EN_DICTIONARY,
          useValue: EN,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        dictionary = TestBed.inject(EN_DICTIONARY);
      });
  }));

  it('should create the app', () => {
    expect(dictionary).toEqual(
      jasmine.objectContaining({
        shared: {
          title: 'NX NG Starter',
        },
      }),
    );
  });
});
