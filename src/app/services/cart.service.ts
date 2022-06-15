import { Injectable } from '@angular/core';
import { OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage = sessionStorage;
  constructor() {
    let data = JSON.parse(this.storage.getItem('cartItems')!);
    if (data != null) {
      this.cartItems = data;
      this.computeTotals();
    }

  }
  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  addToCart(theCartItem: CartItem) {
    let alreadyExistInCart: boolean = false;
    let existCartItem: CartItem = undefined!;

    // check if we have the item before in the cart
    if (this.cartItems.length > 0) {

      existCartItem = this.cartItems.find(cartItemTmp => cartItemTmp.id === theCartItem.id)!;
      // for (let cartItemTmp of this.cartItems) {
      //   if (cartItemTmp.id === cartItem.id) {
      //     existCartItem = cartItemTmp;
      //     alreadyExistInCart = true;
      //     break;
      //   }
      // }
    }
    // find the item if exist
    if (alreadyExistInCart = (existCartItem != undefined)) {
      existCartItem.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }
    //compute total quantity and total price
    this.computeTotals();

  }

  computeTotals() {

    let totalPricevalue: number = 0;
    let totalQuantityValue: number = 0;
    for (let cartItemTmp of this.cartItems) {
      totalPricevalue += cartItemTmp.quantity * cartItemTmp.unitPrice;
      totalQuantityValue += cartItemTmp.quantity;
    }
    //publish new values ...all subscribers will receive new data
    this.totalPrice.next(totalPricevalue);
    this.totalQuantity.next(totalQuantityValue);

    this.logDataCart(totalPricevalue, totalQuantityValue);

    // persist data
    this.persistCartItems();
  }



  logDataCart(totalPricevalue: number, totalQuantityValue: number) {

    for (let cartItemTmp of this.cartItems) {

      const subtotal = cartItemTmp.quantity * cartItemTmp.unitPrice;

      console.log(` curr item ${cartItemTmp.name}, price ${cartItemTmp.unitPrice} , quantity ${cartItemTmp.quantity} , subtotal ${subtotal}`)
    }

    console.log(` total price cart ${totalPricevalue.toFixed(2)}`);

    console.log(` total quantity cart ${totalQuantityValue.toFixed(2)}`);
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity == 0) {
      this.remove(theCartItem);
    } else {
      this.computeTotals();
    }
  }

  remove(theCartItem: CartItem) {
    const indexCartItem = this.cartItems.findIndex(tmpCartitem => tmpCartitem.id == theCartItem.id);

    if (indexCartItem > -1) {
      this.cartItems.splice(indexCartItem, 1);
      this.computeTotals();
    }
  }
}




