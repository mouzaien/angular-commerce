import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
private orderUrl = "localhost:8080/api/orders";
  constructor(private httpClient: HttpClient) { }


  getOrderHistory(userEmail : string):Observable<getResponseOrderHistory>{
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmail?email=${userEmail}`;

  return this.httpClient.get<getResponseOrderHistory>(orderHistoryUrl);

}
}
interface getResponseOrderHistory{
  _embedded :{
    orders: OrderHistory[];
  }

}