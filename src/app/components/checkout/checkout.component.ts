import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  storage: Storage = sessionStorage;
  checkoutFormGroup !: FormGroup;
  totalQuantity: number = 0.00;
  totalPrice: number = 0.00;
  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];
  countries: Country[] = [];
  states: State[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  // initialize stripe api
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";
  isDisabled: boolean = false;
  constructor(private formBuilder: FormBuilder, private luv2ShopFormService: Luv2ShopFormService, private cardService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {

    // setup Stripe payment form
    this.setupStripePaymentForm();

    this.reviewCartDetails();
    const logUserEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        // firstName: [''],
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
        email: new FormControl(logUserEmail, [Validators.required, Validators.pattern('[a-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,4}$')]),
      }
      ),

      // shipping adress group
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }
      ),

      // billing address

      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }
      ),
      // credit cart

      creditCard: this.formBuilder.group({

        // not need when using stripe
        /*
        CardType: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        NameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}$')]),
        SecurityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}$')]),
        ExpirationMonth: new FormControl('', [Validators.required]),
        ExpirationYear: new FormControl('', [Validators.required]),
        */
      }
      )
    }

    );


    // populate credit card months 
    /*let startMonth = new Date().getMonth() + 1;

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );
    // populate credit card years

    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    );
*/
    // populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
    // populate states
    // this.luv2ShopFormService.getStates().subscribe(
    //   data => {
    //     this.states = data;
    //   }
    // );

  }
  setupStripePaymentForm() {

    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element ... and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event) => {

      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }

    });

  }

  get firstName(): any { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName(): any { return this.checkoutFormGroup.get('customer.lastName'); }
  get email(): any { return this.checkoutFormGroup.get('customer.email'); }

  //shippingAddress
  get shippingAddressStreet(): any { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity(): any { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressZipCode(): any { return this.checkoutFormGroup.get('shippingAddress.zipcode'); }
  get shippingAddressState(): any { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry(): any { return this.checkoutFormGroup.get('shippingAddress.country'); }

  //billingAddress
  get billingAddressStreet(): any { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity(): any { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressZipCode(): any { return this.checkoutFormGroup.get('billingAddress.zipcode'); }
  get billingAddressState(): any { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry(): any { return this.checkoutFormGroup.get('billingAddress.country'); }

  //creditCard
  get creditCardCardType(): any { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard(): any { return this.checkoutFormGroup.get('creditCard.NameOnCard'); }
  get creditCardNumber(): any { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode(): any { return this.checkoutFormGroup.get('creditCard.SecurityCode'); }
  get creditCardExpirationMonth(): any { return this.checkoutFormGroup.get('creditCard.ExpirationMonth'); }
  get creditCardExpirationYear(): any { return this.checkoutFormGroup.get('creditCard.ExpirationYear'); }


  reviewCartDetails() {

    // subscribe to cartService.totalQuantity
    this.cardService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cardService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }
  onSubmit() {
    console.log(` values submitted ${this.checkoutFormGroup.get('customer')!.value.firstName}`);

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cardService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //compute payment info 
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'USD';
    this.paymentInfo.receiptEmail = purchase.customer.email;

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry.value.code
                  }
                }
              }
            }, { handleActions: false })
            .then((result) => {
              if (result.error) {
                // inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;

              } else {
                // call REST API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: response => {
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

                    // reset cart
                    this.resetCart();
                    this.isDisabled = false;

                  },
                  error: err => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;

                  }
                })
              }
            });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }
  resetCart() {
    // reset cart data
    this.cardService.cartItems = [];
    this.cardService.totalPrice.next(0);
    this.cardService.totalQuantity.next(0);

    //clear card
    this.cardService.persistCartItems();
    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }
  copyShippingAddressToBillingAddress(event) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      //fix the bug
      this.billingAddressStates = this.billingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      //fix bug
      this.billingAddressStates = [];
    }

  }

  handleMonthsAndYears() {


    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currYear: number = new Date().getFullYear();
    let startMonth: number;
    //= new Date().getMonth();
    const selectedYear: number = Number(creditCardFormGroup!.value.ExpirationYear);

    if (currYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }

    );
  }

  getStates(formGroupName: string) {


    const theformgroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode: string = theformgroup?.value.country.code;

    const countryName: string = this.checkoutFormGroup.get(formGroupName)?.value.country.name;

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        //select the first item
        if (theformgroup != null) theformgroup.get('state')?.setValue(data[0]);
      }
    );
  }
}
