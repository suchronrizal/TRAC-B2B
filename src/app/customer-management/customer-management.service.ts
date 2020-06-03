import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import 'rxjs/add/operator/map';

import { MainService } from '../lib/service/main.service';

@Injectable()
export class CustomerManagementService {
	// Read Business Unit ID
	private businessUnitID = null;
	updateBusinessUnitId(e) {
		this.businessUnitID = e;
	}

	// Section Customer
	private urlCustomer: string = this.mainService['hostCostumer'] + '/customer';
	private urlCustomerDetail: string = this.mainService['hostCostumer'] + '/customer/detail/';
	private urlOrganization = this.mainService['hostOrg'] + '/organization/organization-structure/';
	private urlOrganizationByCustomer = this.mainService['hostOrg'] + '/organization/organization-structure/customer/';
	private urlOrgName: string = this.mainService['hostOrg'] + '/organization/config-organization/id/customer/';
	private urlStepConf = this.mainService['hostCon'] + '/configuration/step';

	// Section Cost Center Organization Structure
	private urlGetCostCenter = this.mainService['hostOrg'] + '/organization/cost-center/customer-id/';
	private urlPostCostCenter = this.mainService['hostOrg'] + '/organization/cost-center/save/';
	private urlDeleteCostCenter = this.mainService['hostOrg'] + '/organization/cost-center/delete/';
	private urlGetOrgStructure = this.mainService['hostOrg'] + '/organization/view-tree/';
	private urlGetOrgStructureApproval = this.mainService['hostOrg'] + '/organization/view-tree-approval/';
	private urlGetApproverPicCostCenter = this.mainService['hostOrg'] + '/organization/direct-approver/view-all/';
	private urlSaveOrganization: string = this.mainService['hostOrg'] + '/organization/config-organization/save-multiple';
	private urlSaveOrganizationOne: string = this.mainService['hostOrg'] + '/organization/config-organization/save';
	private urlUpdateOrganizationOne: string = this.mainService['hostOrg'] + '/organization/config-organization/update/';
	private urlGetOrganizationStructure: string = this.mainService['hostOrg'] + '/organization/config-organization/';
	private urlDeleteAllOrg: string = this.mainService['hostOrg'] + '/organization/config-organization/truncate-table';
	private urlDeleteOrg: string = this.mainService['hostOrg'] + '/organization/config-organization/delete/';
	private urlDeleteOrgById: string = this.mainService['hostOrg'] + '/organization/config-organization/delete';
	private urlUpdatePoolIdOrganization: string =
		this.mainService['hostOrg'] + '/organization/config-organization/update/';

	// Section Eligibility
	private urlGetEligibility = this.mainService['hostCon'] + '/configuration/vehicle-type?customerId=';
	private urlGetEligibilityCategory = this.mainService['hostCon'] + '/configuration/eligibility-category';
	private urlSaveEligibility = this.mainService['hostCon'] + '/configuration/eligibility/save';
	private urlUpdateEligibility = this.mainService['hostCon'] + '/configuration/eligibility/update/';
	private urlSaveEligibilityDetail = this.mainService['hostCon'] + '/configuration/eligibility-detail/save';
	private urlDetailEligibility = this.mainService['hostCon'] + '/configuration/eligibility/detail-by-customer/';

	// Section City
	private urlProvince: string = this.mainService['hostCon'] + '/configuration/province';
	private urlCity: string = this.mainService['hostCon'] + '/configuration/city';
	private urlSaveCity: string = this.mainService['hostCon'] + '/configuration/city-coverage/save';
	private urlCityByCustomer: string = this.mainService['hostCon'] + '/configuration/city-coverage/detail-by-customer/';
	private urlUpdateCity: string = this.mainService['hostCon'] + '/configuration/city-coverage/update/';
	private urlDetailCity: string = this.mainService['hostCon'] + '/configuration/city/detail/';

	// Section Price & Payment
	private urlPostPrice: string = this.mainService['hostPrice'] + '/price/configuration-price-adjustment/save';
	private urlUpdatePrice: string = this.mainService['hostPrice'] + '/price/configuration-price-adjustment/update/';

	private urlGetPriceDetail: string =
		this.mainService['hostPrice'] + '/price/configuration-price-adjustment-detail/customer/';
	private urlUpdatePriceDetail: string =
		this.mainService['hostPrice'] + '/price/configuration-price-adjustment-detail/update';
	private urlPostPriceDetail: string =
		this.mainService['hostPrice'] + '/price/configuration-price-adjustment-detail/save';

	private urlUpdatePriceCancelation: string =
		this.mainService['hostPrice'] + '/price/configuration-price-cancelation/update/';
	private urlGetPrice: string = this.mainService['hostPrice'] + '/price/configuration-price-adjustment/customer/';
	private urlGetCPM: string = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme';
	private urlGetPaymentType: string = this.mainService['hostBilling'] + '/billing/payment-type';
	private urlGetPaymentScheme: string = this.mainService['hostBilling'] + '/billing/payment-scheme';
	private urlSavePayment: string = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/save';
	private urlUpdatePayment: string = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/update/';
	private urlUpdatePaymentEmployee: string =
		this.mainService['host'] + '/authorization/user-profile/update-profile-b2b/';
	private urlGetPayment: string = this.mainService['hostBilling'] + '/billing/configuration-payment-scheme/customer/';
	private urlUserPerCostCenter: string = this.mainService['host'] + '/authorization/user-profile/customer/';
	private urlUpdatePaymentDetail: string =
		this.mainService['hostBilling'] + '/billing/configuration-payment-scheme-detail/update/';
	private urlInsertPaymentDetail: string =
		this.mainService['hostBilling'] + '/billing/configuration-payment-scheme-detail/save/';
	private urlUpdateBillingDate: string = this.mainService['hostBilling'] + '/billing/billing-dates/update/';
	private urlHistoryBudget: String = this.mainService['hostBilling'] + '/billing/topup-history';

	private urlGetProductPrice: string = this.mainService['hostPrice'] + '/price/configuration-price-product/customer/';
	private urlPostProductPrice: string = this.mainService['hostPrice'] + '/price/configuration-price-product/save';
	private urlUpdateProductPrice: string = this.mainService['hostPrice'] + '/price/configuration-price-product/update';
	private urlImportProductPrice: string =
		this.mainService['hostPrice'] + '/price/configuration-price-product/save-multiple';

	// Section Approval Notif
	private urlGetApprovalScheme: string = this.mainService['hostCon'] + '/configuration/approval-schema';
	private urlGetExecutionType: string = this.mainService['hostCon'] + '/configuration/execution-type';
	private urlGetNotificationType: string = this.mainService['hostNotif'] + '/notification-type';
	private urlGetApprovalDirect: string = this.mainService['hostCon'] + '/configuration/approval-direct-type';
	private urlPostApproval: string = this.mainService['hostCon'] + '/configuration/approval/save';
	private urlUpdateApproval: string = this.mainService['hostCon'] + '/configuration/approval/update/';
	private urlGetApproval: string = this.mainService['hostCon'] + '/configuration/approval';
	private urlGetDetailByCustomer: string = this.mainService['hostCon'] + '/configuration/approval/detail-by-customer/';
	private urlGetNotificationByCustomer: string =
		this.mainService['hostCon'] + '/configuration/notification/detail-by-customer/';
	private urlGetOrganizationByPic: string = this.mainService['host'] + '/authorization/user-profile/organization/';
	private urlAutoCompleteProfile = this.mainService['host'] + '/authorization/user-profile/auto-complete/';
	// Package Additional
	private urlPostPackage: string = this.mainService['hostCon'] + '/configuration/additional-package/save';

	// Section Finish Configuration
	private urlSaveConfiguration: string = this.mainService['hostCon'] + '/configuration/save';

	// Customer Group
	private urlGetCustomerGroup: string = this.mainService['hostCostumer'] + '/customer/customer-group';
	private urlPostCustomerGroup: string = this.mainService['hostCostumer'] + '/customer/customer-group/save';
	private urlPutCustomerGroup: string = this.mainService['hostCostumer'] + '/customer/customer-group/update/';
	private urlDeleteCustomerGroup: string = this.mainService['hostCostumer'] + '/customer/customer-group/delete/';
	private urlPostCustomerGroupDetail: string =
		this.mainService['hostCostumer'] + '/customer/customer-group-detail/save';
	private urlGetCustomerGroupDetail: string =
		this.mainService['hostCostumer'] + '/customer/customer-group-detail/customer/';
	private urlUpdatetCustomerGroupDetail: string =
		this.mainService['hostCostumer'] + '/customer/customer-group-detail/update/';

	// Service Type Detail
	private urlGetServiceType: string = this.mainService['hostProduct'] + '/product/service-type/detail-by-customer/';
	private urlPostServiceType: string = this.mainService['hostProduct'] + '/product/service-type/save';
	private urlPutServiceType: string = this.mainService['hostProduct'] + '/product/service-type/update/';

	// Get Detail Customer
	private urlGetConfigratation: string = this.mainService['hostCon'] + '/configuration/detail-by-customer/';

	// Driver
	private urlDriverRider: string = this.mainService['hostOrder'] + '/order/driver-or-rider/';

	constructor(private http: Http, private mainService: MainService) {}

	// Detail Configuration
	// ================================================================================ //
	getDetailCustomer(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetConfigratation + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	postConfiguration(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlSaveConfiguration, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Service Type
	// ============================================================================== //
	getServiceType(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetServiceType + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	postServiceType(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlPostServiceType, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	putServiceType(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.put(this.urlPutServiceType + id, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Customer Group
	// ============================================================================== //
	getCustomerGroup() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetCustomerGroup, options).map((res: Response) => res.json());
	}
	postCustomerGroup(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlPostCustomerGroup, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	putCustomerGroup(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.put(this.urlPutCustomerGroup + id, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	deleteCustomerGroup(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteCustomerGroup + id, options).map((res: Response) => res.json());
	}
	postCustomerGroupDetail(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlPostCustomerGroupDetail, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	getCustomerGroupDetail(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetCustomerGroupDetail + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	putCustomerGroupDetail(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.put(this.urlUpdatetCustomerGroupDetail + id, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Package
	// ============================================================================== //
	postPackage(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostPackage, JSON.stringify(body), options).map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Step Configuration
	// ============================================================================== //
	getStepConfiguration(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlStepConf + '/detail-by-customer/' + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	postStepConfiguration(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlStepConf + '/save/', JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	putStepConfiguration(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.put(this.urlStepConf + '/update/' + id, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Approval Notif
	// ============================================================================== //
	getApprovalScheme(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetApprovalScheme, options).map((res: Response) => res.json());
	}
	getExecutionType(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetExecutionType, options).map((res: Response) => res.json());
	}
	getNotificationType(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetNotificationType, options).map((res: Response) => res.json());
	}
	getApprovalDirect(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetApprovalDirect, options).map((res: Response) => res.json());
	}
	postApproval(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http.post(this.urlPostApproval, JSON.stringify(mergeBody), options).map((res: Response) => res.json());
	}
	updateApproval(body, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateApproval + id, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	getApproval(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetApproval, options).map((res: Response) => res.json());
	}
	getDetailByCustomer(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetDetailByCustomer + id, options).map((res: Response) => res.json());
	}
	getNotifByCustomer(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetNotificationByCustomer + id, options).map((res: Response) => res.json());
	}

	getOrganizationByPic(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetOrganizationByPic + id, options).map((res: Response) => res.json());
	}

	getAccountByCustomerAutocomplete(id: String, keywords: String) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlAutoCompleteProfile + id + '/' + dataUser.UserCompanyMapping[0].BusinessUnitId + '?Search=' + keywords,
				options
			)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	// ============================================================================== //
	// Price & Payment
	// ============================================================================== //
	getPriceDetail(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetPriceDetail + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	postPriceDetail(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		_.map(body, x => {
			x = _.merge(x, { BusinessUnitId: this.businessUnitID });
		});
		return this.http.post(this.urlPostPriceDetail, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	putPriceDetail(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdatePriceDetail, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	putPriceDetailById(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlUpdatePriceDetail + `/${id}`, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	getProductPrice(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetProductPrice + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	postProductPricePayment(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		_.map(body, x => {
			x = _.merge(x, { BusinessUnitId: this.businessUnitID });
		});
		return this.http.post(this.urlPostProductPrice, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	putProductPricePayment(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateProductPrice, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	updatePriceCancelation(body: any, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlUpdatePriceCancelation + id, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	postPrice(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http.post(this.urlPostPrice, JSON.stringify(mergeBody), options).map((res: Response) => res.json());
	}
	updatePrice(body: any, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdatePrice + id, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	getPrice(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetPrice + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	updateIndiPriceAndProduct(body: any, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlUpdateProductPrice + '/' + id, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	importProductPrice(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlImportProductPrice, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	saveIndiPriceAndProduct(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlPostProductPrice, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	getUserCostCenter(customerId, costCenterId): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlUserPerCostCenter +
					customerId +
					'/cost-center/' +
					costCenterId +
					'?BusinessUnitId=' +
					this.businessUnitID,
				options
			)
			.map((res: Response) => res.json());
	}
	getUser(customerId): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlUserPerCostCenter + customerId + '?BusinessUnitId=' + this.businessUnitID + '&RoleId=RL-008',
				options
			)
			.map((res: Response) => res.json());
	}
	getScheme() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetCPM, options).map((res: Response) => res.json());
	}
	getPaymentType() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetPaymentType, options).map((res: Response) => res.json());
	}
	getPaymentScheme() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetPaymentScheme, options).map((res: Response) => res.json());
	}
	postPayment(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http.post(this.urlSavePayment, JSON.stringify(mergeBody), options).map((res: Response) => res.json());
	}
	updatePayment(body: any, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdatePayment + id, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	updatePaymentEmploye(body: any, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlUpdatePaymentEmployee + id, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	getPayment(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetPayment + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	InsertPaymentDetail(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.post(this.urlInsertPaymentDetail, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	updatePaymentDetail(body: any, id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlUpdatePaymentDetail + id, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	updateBillingDate(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.put(this.urlUpdateBillingDate + id, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}

	getHistoryBudget(id: any, url) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlHistoryBudget + '?BusinessUnitId=' + this.businessUnitID + '&CustomerId=' + id + url, options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Post Organization
	// ============================================================================== //
	postOrg(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlSaveOrganization, JSON.stringify(body), options).map((res: Response) => res.json());
	}
	postOrgOne(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlSaveOrganizationOne, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	putOrgOne(body: any, id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.put(this.urlUpdateOrganizationOne + id, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	getOrgStructure(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetOrganizationStructure + id, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	getOrgStructureTree(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetOrgStructure + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getApproverPicCostCenter(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetApproverPicCostCenter + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getOrgStructureTreeApproval(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetOrgStructureApproval + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getOrganization() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlOrganization + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getOrganizationByCustomer(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlOrganizationByCustomer + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getOrganizationName(CustomerId: String, OrganizationId: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(
				this.urlOrgName + CustomerId + '/organization/' + OrganizationId + '?BusinessUnitId=' + this.businessUnitID,
				options
			)
			.map((res: Response) => res.json());
	}
	deleteOrg(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteOrg + id, options).map((res: Response) => res.json());
	}

	deleteAllOrg() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.delete(this.urlDeleteAllOrg, options).map((res: Response) => res.json());
	}

	deleteOrgById(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.urlDeleteOrgById, JSON.stringify(body), options).map((res: Response) => res.json());
	}

	// ============================================================================== //
	// City Coverage
	// ============================================================================== //
	getProvince(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlProvince, options).map((res: Response) => res.json());
	}
	postCity(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http.post(this.urlSaveCity, JSON.stringify(mergeBody), options).map((res: Response) => res.json());
	}
	getCity(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlCity + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getCityDetail(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlDetailCity + id, options).map((res: Response) => res.json());
	}
	getCityByCustomer(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlCityByCustomer + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	updateCity(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.put(this.urlUpdateCity + id, JSON.stringify(body), options).map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Customer
	// ============================================================================== //
	getCustomer(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlCustomer, options).map((res: Response) => res.json());
	}
	getCustomerDetail(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlCustomerDetail + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Eligibility
	// ============================================================================== //
	getEligibility(id: String): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetEligibility + id + '&businessUnitID=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	getEligibilityCategory(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlGetEligibilityCategory, options).map((res: Response) => res.json());
	}
	getDetailELigibility(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlDetailEligibility + id, options).map((res: Response) => res.json());
	}
	postEligibility(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlSaveEligibility, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	postEligibilityDetail(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.post(this.urlSaveEligibilityDetail, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
	updateEligibility(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.put(this.urlUpdateEligibility + id, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Cost Center
	// ============================================================================== //
	getCostCenter(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlGetCostCenter + id + '?BusinessUnitId=' + this.businessUnitID, options)
			.map((res: Response) => res.json());
	}
	postCostCenter(body: any) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		let mergeBody = _.merge(body, { BusinessUnitId: this.businessUnitID });
		return this.http
			.post(this.urlPostCostCenter, JSON.stringify(mergeBody), options)
			.map((res: Response) => res.json());
	}
	deleteCostCenter(id: String, customerId: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.delete(this.urlDeleteCostCenter + id + '/' + customerId, options)
			.map((res: Response) => res.json());
	}

	// Driver
	// ======================== //
	getDriverRider(): Observable<any> {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });
		return this.http
			.get(this.urlDriverRider + this.businessUnitID, options)
			.timeout(this.mainService['timeOut'])
			.map((res: Response) => res.json());
	}
	updatePoolIdOrganization(body: any, id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.mainService['token']
		});
		let options = new RequestOptions({ headers: headers });

		return this.http
			.put(this.urlUpdatePoolIdOrganization + id, JSON.stringify(body), options)
			.map((res: Response) => res.json());
	}
}
