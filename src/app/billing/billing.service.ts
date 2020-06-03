import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class BillingService {
  // ============================================================================== //
  // Properties
  // ============================================================================== //
  private urlGetInvoice = this.mainService['hostBilling'] + '/billing/invoice-header/';
  private urlGetInvoiceStatus = this.mainService['hostBilling'] + '/billing/invoice-status/';
  private urlUpdateInvoie = this.mainService['hostBilling'] + '/billing/invoice-header/update/';
  private urlGetTransaction: string =
    this.mainService['hostOrder'] + '/order/reservation/get-report';
  private urlProfile = this.mainService['host'] + '/authorization/user-profile/all';
  private urlCustomer: string = this.mainService['hostCostumer'] + '/customer';
  private urlProfileCustomer = this.mainService['host'] + '/authorization/user-profile/customer/';
  private urlGetCityCoverage: string =
    this.mainService['hostCon'] + '/configuration/city-coverage/detail-by-customer/';
  private urlGetCostCenter = this.mainService['hostOrg'] + '/organization/cost-center/customer-id/';
  private urlGetDetailOrderHistory: string =
    this.mainService['hostOrder'] + '/order/reservation/detail/';
  private urlUpdateSONumber = this.mainService['hostOrder'] + '/order/reservation/createSO/';
  private urlUpdateInvoiceHeader =
    this.mainService['hostBilling'] + '/billing/invoice-header/update/';
  private urlGetCostCenterDetail = this.mainService['hostOrg'] + '/organization/cost-center/';

  constructor(private http: Http, private mainService: MainService) {
    this.mainService.updateLocalStorage();
  }

  // ============================================================================== //
  // Cost Center
  // ============================================================================== //
  getDetailCostCenter(id) {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      let headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.mainService['token']
      });
      let options = new RequestOptions({ headers: headers });
      return this.http
        .get(
          this.urlGetCostCenterDetail +
            id +
            '?BusinessUnitId=' +
            dataUser.UserCompanyMapping[0].BusinessUnitId,
          options
        )
        .map((res: Response) => res.json());
    }
  }

  // ============================================================================== //
  // CRUD Billing
  // ============================================================================== //
  getBilling(url) {
    let dataUser = JSON.parse(this.mainService['dataUser']);
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(this.urlGetInvoice + url, options).map((res: Response) => res.json());
  }
  updateBilling(body: any, id: String) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .put(this.urlUpdateInvoie + id, JSON.stringify(body), options)
      .map((res: Response) => res.json());
  }
  getStatusBilling(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get(this.urlGetInvoiceStatus + id, options)
      .timeout(this.mainService['timeOut'])
      .map((res: Response) => res.json());
  }
  putInvoiceHeader(body: any, id: String) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .put(this.urlUpdateInvoiceHeader + id, JSON.stringify(body), options)
      .map((res: Response) => res.json());
  }

  // ============================================================================== //
  // Transactions
  // ============================================================================== //
  getTransaction(url) {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      let headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.mainService['token']
      });
      let options = new RequestOptions({ headers: headers });

      let urlBusinessUnit;
      if (dataUser.UserIndicator[0].RoleIndicatorId != 'MRI001') {
        urlBusinessUnit = '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId;
      } else {
        urlBusinessUnit = '?';
        url = url.substr(1);
      }
      return this.http
        .get(this.urlGetTransaction + urlBusinessUnit + url, options)
        .map((res: Response) => res.json());
    }
  }

  // Customer
  // ======================== //
  getCustomer(): Observable<any> {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      let headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.mainService['token']
      });
      let options = new RequestOptions({ headers: headers });
      return this.http
        .get(
          this.urlCustomer + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId,
          options
        )
        .timeout(this.mainService['timeOut'])
        .map((res: Response) => res.json());
    }
  }

  // ============================================================================== //
  // GET PIC
  // ============================================================================== //
  getAccount() {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      let headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.mainService['token']
      });
      let options = new RequestOptions({ headers: headers });
      let indicatorId = dataUser.UserIndicator[0].RoleIndicatorId,
        paramUrl;
      switch (indicatorId) {
        case 'MRI001':
        case 'MRI002':
          paramUrl =
            this.urlProfile + '?BusinessUnitId=' + dataUser.UserCompanyMapping[0].BusinessUnitId;
          break;
        case 'MRI003':
        case 'MRI004':
          paramUrl =
            this.urlProfileCustomer +
            dataUser.UserProfileB2B[0].CustomerId +
            '?BusinessUnitId=' +
            dataUser.UserCompanyMapping[0].BusinessUnitId;
          break;
      }
      return this.http.get(paramUrl, options).map((res: Response) => res.json());
    }
  }

  getPicByCustomer(customerId: String): Observable<any> {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      let headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.mainService['token']
      });
      let options = new RequestOptions({ headers: headers });
      return this.http
        .get(
          this.urlProfileCustomer +
            customerId +
            '?BusinessUnitId=' +
            dataUser.UserCompanyMapping[0].BusinessUnitId,
          options
        )
        .timeout(this.mainService['timeOut'])
        .map((res: Response) => res.json());
    }
  }
  // ============================== //
  // Get City Coverage
  // ============================== //
  getCityCoverage(id: String): Observable<any> {
    let dataUser = JSON.parse(this.mainService['dataUser']);
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get(this.urlGetCityCoverage + id +
        '?BusinessUnitId=' +
        dataUser.UserCompanyMapping[0].BusinessUnitId, options)
      .timeout(this.mainService['timeOut'])
      .map((res: Response) => res.json());
  }

  // ============================== //
  // Get Cost Center
  // ============================== //
  getCostCenter(id: String) {
    if (this.mainService['dataUser'] != null) {
      let dataUser = JSON.parse(this.mainService['dataUser']);
      let headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.mainService['token']
      });
      let options = new RequestOptions({ headers: headers });
      return this.http
        .get(
          this.urlGetCostCenter +
            id +
            '?BusinessUnitId=' +
            dataUser.UserCompanyMapping[0].BusinessUnitId,
          options
        )
        .map((res: Response) => res.json());
    }
  }

  // ============================== //
  // Get Reservation Detail
  // ============================== //
  getOrderHistoryDetail(id: String): Observable<any> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get(this.urlGetDetailOrderHistory + id, options)
      .timeout(this.mainService['timeOut'])
      .map((res: Response) => res.json());
  }

  putSONumber(body: any, id: String) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.mainService['token']
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .put(this.urlUpdateSONumber + id, JSON.stringify(body), options)
      .map((res: Response) => res.json());
  }
}
