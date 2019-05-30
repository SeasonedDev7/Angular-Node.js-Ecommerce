import { debounceTime, first, filter, take } from 'rxjs/operators';
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, BehaviorSubject } from 'rxjs';

import * as fromRoot from '../store/reducers';
import { Store } from '@ngrx/store';
import * as actions from './../store/actions';
import { TranslateService } from '../services/translate.service';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user$             : Observable<any>;
  cart$             : Observable<any>;
  productTitles$    : Observable<any>;
  userOrders$       : Observable<any>;
  showAutocomplete$ : BehaviorSubject<boolean> = new BehaviorSubject(false);
  languageOptions = ['en', 'sk', 'cs'];
  choosenLanguage = 'en';
  showMobileNav   = false;
  cartUrl         : string;
  ordersUrl       : string;
  productUrl      : string;

  readonly query: FormControl = new FormControl();


  constructor(
    @Inject(PLATFORM_ID)
    private _platformId : Object,
    private store: Store<fromRoot.State>, private translate: TranslateService) {
    this.store
      .select(fromRoot.getLang)
      .pipe(filter(Boolean))
      .subscribe(lang => {
        this.choosenLanguage = lang;
        translate.use(this.choosenLanguage);
      });

    this.translate.translationsSub$.pipe(filter(Boolean)).subscribe(translations => {
      this.cartUrl = '/' + this.translate.lang + '/' + (translations['cart'] || 'cart');
      this.ordersUrl = `/${this.translate.lang}/${translations['orders']}`;
      this.productUrl = `/${this.translate.lang}/${translations['product']}`;
    });
  }

  ngOnInit() {
    this.user$ = this.store.select(fromRoot.getUser);
    this.cart$ = this.store.select(fromRoot.getCart);
    this.productTitles$ = this.store.select(fromRoot.getProductTitles);
    this.userOrders$ = this.store.select(fromRoot.getUserOrders);

    this.query.valueChanges.pipe(debounceTime(200)).subscribe(value => {
      const sendQuery = value || 'EMPTY___QUERY';
      this.store.dispatch(new actions.LoadProductsSearch(sendQuery));
    });

    this.user$.pipe(filter(() => isPlatformBrowser(this._platformId)), take(1)).subscribe(user => {
      if (!user) {
        this.store.dispatch(new actions.LoadUserAction());
      }
    });

    this.user$
      .pipe(
        filter(user => user && user._id),
        take(1)
      )
      .subscribe(user => {
        this.store.dispatch(new actions.LoadUserOrders({ token: user._id }));
      });

    this.cart$.pipe(filter(() => isPlatformBrowser(this._platformId)), take(1)).subscribe(cart => {
      if (!cart) {
        this.store.dispatch(new actions.GetCart());
      }
    });
  }

  onFocus() {
    this.showAutocomplete$.next(true);
  }

  onBlur() {
    setTimeout(() => this.showAutocomplete$.next(false), 300);
  }

  onTitleLink(productUrl) {
    this.query.setValue('');
  }

  setLang(lang: string) {
    const langUpdate = {
      lang: lang,
      currency: lang === 'cs' ? 'CZK' : '€'
    };
    this.store.dispatch(new actions.ChangeLang(langUpdate));
  }
}
