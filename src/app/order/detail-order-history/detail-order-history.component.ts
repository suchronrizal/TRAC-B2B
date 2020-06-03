import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';

import { OrderService } from '../order.service';
import { MainService } from '../../lib/service/main.service';

import { Message } from 'primeng/components/common/api';

@Component({
	selector: 'app-detail-order-history',
	templateUrl: './detail-order-history.component.html',
	styleUrls: ['./detail-order-history.component.scss']
})
export class DetailOrderHistoryComponent implements OnInit {
	public dataOrderHistory = null;
	private data = [];
	public detailOrder = null;
	private colPickup: any = [];
	private dataPassenger = [];
	public cols: any[];
	public additionals: any[];
	public roleId: String;
	private colPassenger: any[];
	private colDrivers: any[];
	private extendDurations: any[];
	private selectedValues: string[];
	private reservationId;
	private disableCancelReservation: boolean = false;
	private checkStatusApproval: Boolean = false;
	private id;
	public isInternal = false;

	private statusOrder = [
		{ value: 'BOSID-001', label: 'BREAKDOWN' },
		{ value: 'BOSID-002', label: 'CANCELLED' },
		{ value: 'BOSID-003', label: 'DELIVERY COMPLETED' },
		{ value: 'BOSID-004', label: 'DRAFT' },
		{ value: 'BOSID-005', label: 'ON JOURNEY' },
		{ value: 'BOSID-006', label: 'APPROVED' },
		{ value: 'BOSID-007', label: 'ORDER COMPLETED' },
		{ value: 'BOSID-009', label: 'READY TO BILL' },
		{ value: 'BOSID-010', label: 'WAITING FOR PAYMENT' },
		{ value: 'BOSID-011', label: 'WAITING FOR APPROVAL' },
		{ value: 'BOSID-012', label: 'REJECTED' }
	];

	private statusReservation = [
		{ value: 'BOSID-001', label: 'BREAKDOWN' },
		{ value: 'BOSID-002', label: 'CANCELLED' },
		{ value: 'BOSID-003', label: 'DELIVERY COMPLETED' },
		{ value: 'BOSID-004', label: 'DRAFT' },
		{ value: 'BOSID-005', label: 'ON JOURNEY' },
		{ value: 'BOSID-006', label: 'APPROVED' },
		{ value: 'BOSID-007', label: 'ORDER COMPLETED' },
		{ value: 'BOSID-009', label: 'READY TO BILL' },
		{ value: 'BOSID-010', label: 'WAITING FOR PAYMENT' },
		{ value: 'BOSID-011', label: 'WAITING FOR APPROVAL' },
		{ value: 'BOSID-012', label: 'REJECTED' }
	];

	// Notification
	// =========================== //
	public msgs: Message[] = [];

	@ViewChild('filterSearch') filterSearch;

	constructor(private route: ActivatedRoute, private orderService: OrderService, private mainService: MainService) {}

	ngOnInit() {
		this.route.params.forEach((params: Params) => {
			this.id = params['id'];
			this.fetchReservation(this.id);
		});

		this.additionals = [
			{
				field: 'Date',
				header: 'Date',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'QuantityTrip',
				header: 'Quantity Trip',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'PriceTrip',
				header: 'Price Trip',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'QuantityOLC',
				header: 'Quantity OLC',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'PriceOLC',
				header: 'Price OLC',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'EmailApproval',
				header: 'Email Approval',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'Status',
				header: 'Status End Order',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			}
		];

		this.cols = [
			{
				field: 'No',
				header: 'No.',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true,
				styleClass: 'td-number'
			},
			{
				field: 'BookingOrderId',
				header: 'Booking Order',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true
			},
			{
				field: 'CustomStartDate',
				header: 'Start Date',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'UnitTypeName',
				header: 'Vehicle Type',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'LicensePlate',
				header: 'License Plate',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'CityName',
				header: 'City',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'StatusName',
				header: 'Status',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			}
		];

		this.colPickup = [
			{
				field: 'ReservationDetailId',
				header: 'Reservation Detail',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true
			},
			{
				field: 'Time',
				header: 'Time',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true
			},
			{
				field: 'Alamat',
				header: 'Alamat',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true,
				styleClass: 'td-address'
			}
		];

		this.colPassenger = [
			{
				field: 'Name',
				header: 'Name',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'Email',
				header: 'Email',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'IsPIC',
				header: 'Requester',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'PhoneNumber',
				header: 'Phone Number',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			}
		];

		this.colDrivers = [
			{
				field: 'NRPDriver',
				header: 'NRP Driver',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'DriverName',
				header: 'Driver Name',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			},
			{
				field: 'Phone',
				header: 'Phone',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: false
			}
		];

		this.extendDurations = [
			{
				field: 'AddDuration',
				header: 'Add Duration',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true
			},
			{
				field: 'AddDurationPrice',
				header: 'Add Duration Price',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true
			},
			{
				field: 'created_at',
				header: 'Created',
				filter: false,
				filterMatchMode: 'contains',
				ref: null,
				checked: true,
				disableCol: true
			}
		];

		let filterChecked = [];
		_.map(this.cols, x => {
			if (x.checked) {
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;

		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (dataUser.RoleId == 'RL-001') {
			this.isInternal = true;
		}
		this.roleId = dataUser.RoleId;
	}
	// Toggle Checkbox Columns
	// =========================== //
	checkBox(e) {
		if (e.checked) {
			e.checked = false;
		} else {
			e.checked = true;
		}
	}

	isRowSelected(rowData: any) {
		return rowData.StatusId == 'BOSID-002' || rowData.Status == 'BOSID-011' ? 'blocked' : null;
	}

	// ============================================================================== //
	// Fetch Order History Detail
	// ============================================================================== //
	fetchReservation(id) {
		this.orderService.getOrderHistoryDetail(id).subscribe(
			res => {
				this.fetchUserDetail(res.Data);
				if (!_.isEmpty(res.Data)) {
					if (_.find(this.statusReservation, { value: res.Data.Status }).label == 'CANCELLED') {
						let cancelationEmail = res.Data.CancelByUser ? ` - ( ${res.Data.CancelByUser} )` : '';
						res.Data['SatatusName'] =
							_.find(this.statusReservation, { value: res.Data.Status }).label + cancelationEmail;
					} else {
						res.Data['SatatusName'] = _.find(this.statusReservation, {
							value: res.Data.Status
						}).label;
					}
					this.dataOrderHistory = res.Data;
					this.dataOrderHistory.created_at = this.convertDateTime(this.dataOrderHistory.created_at);
					this.data = res.Data.details;
					_.map(this.data, (x, i) => {
						x['StatusName'] = _.find(this.statusOrder, {
							value: x.StatusId
						}).label;
						x['No'] = i + 1;
						x['Price'] = Number(x.Price).toLocaleString();
						x['OriginStartDate'] = x.StartDate;
						x['CustomStartDate'] = this.convertDateTime(x.StartDate);
						x['DocumentDate'] = this.convertDateTime(x.DocumentDate);
						x['EndDate'] = this.convertDateTime(x.EndDate);
						_.map(x.pickup_locations, y => {
							y.Time = this.convertDateTime(y.Time);
						});

						_.map(x.extend_durations, y => {
							y.AddDurationPrice = Number(y.AddDurationPrice).toLocaleString();
							y.created_at = moment(y.created_at).format('DD MMM YYYY - HH:mm');
							//y.created_at = this.convertDateTime(y.created_at);
						});

						_.map(x.additional, y => {
							y.PriceTrip = Number(y.PriceTrip).toLocaleString();
							y.PriceOLC = Number(y.PriceOLC).toLocaleString();
							y.Date = moment(y.created_at).format('DD MMM YYYY - HH:mm');
						});

						_.map(x.passengers, x => {
							if (x.IsPIC == '0') {
								x.IsPIC = 'No';
							} else {
								x.IsPIC = 'Yes';
							}
						});
					});

					this.fetchCancelReaseon(res.Data.BusinessUnitId);

					let disableCancelReservation = _.find(this.data, x => {
						return x.StatusId != 'BOSID-006';
					});
					if (disableCancelReservation != undefined) {
						this.disableCancelReservation = true;
					}
				}

				if (this.detailOrder != null) {
					let find = _.find(res.Data.details, { Id: this.detailOrder.Id });
					if (find != undefined) {
						this.detailOrder = find;
					}
				}

				// Fetch Package
				this.fetchFuel();
				this.fetchTollParking();
				this.fetchDriverRider();
				this.fetchDriverSpesification();
				this.fetchChanel();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchReservation(id);
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchReservation(id);
				}
			}
		);
	}
	convertDateTime(str) {
		var date = moment(str.substring(0, 10)).format('DD MMM YYYY') + ' - ' + str.substring(11, 16);
		return (str = date);
	}

	// View Order
	// ============================= //
	public displayOrderDetail: boolean = false;

	viewOrder(e) {
		this.displayOrderDetail = true;
		this.objCancelOrder = null;
		this.detailOrder = e;
		this.fetchAdditional(e);
		var elem = document.getElementById('body').setAttribute('class', 'on');
	}
	closeOrderDetail() {
		this.addDuration = 0;
		this.detailOrder = null;
		this.displayOrderDetail = false;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}
	// Fetch Additional
	// ============================= //
	private addDuration = 0;
	private priceExtend = 0;
	public loadPrice = false;
	fetchAdditional(obj) {
		_.map(this.detailOrder.additional, x => {
			if (x.Status != null) {
				if (x.Status == '1' || x.Status == 'Approved') {
					x.Status = 'Approved';
				} else {
					x.Status = 'Rejected By Customer';
				}
			} else {
				x.Status = '-';
			}
		});
		this.loadPrice = true;
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.orderService
			.getAdditional(
				obj.CityId,
				this.dataOrderHistory.CustomerId,
				obj.MaterialId,
				obj.UnitTypeId,
				this.dataOrderHistory.ServiceTypeId,
				obj.Fuel,
				obj.TollAndParking,
				obj.DriverOrRider,
				this.dataOrderHistory.ChannelId,
				dataUser.UserCompanyMapping[0].BusinessUnitId
			)
			.subscribe(
				res => {
					this.loadPrice = false;
					if (res.Data.length) {
						this.priceExtend = Number(res.Data[0].AdditionalPrice);
					}
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchAdditional(obj);
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchAdditional(obj);
					}
				}
			);
	}

	private btnDuration: boolean = false;
	addExtendDuration() {
		this.btnDuration = true;
		let obj = {
			ReservationDetailId: this.detailOrder.ReservationDetailId,
			BookingOrderId: this.detailOrder.BookingOrderId,
			AddDuration: this.addDuration,
			AddDurationPrice: this.priceExtend * this.addDuration
		};
		this.orderService.postExtend(obj).subscribe(
			res => {
				this.btnDuration = false;
				this.addDuration = 0;
				this.fetchReservation(this.id);
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success extend Order'
				});
			},
			err => {
				this.btnDuration = false;
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed extend Order'
				});
			}
		);
	}

	// Fetch Cancaelation Price
	public loadingMaxOrderTime: boolean = false;
	private arrPriceCancelation = [];
	public priceCancelation: number = 0;
	fetchPriceAdjusmentDetail(isSingle, order) {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			if (dataUser.UserProfileB2B[0] != null) {
				this.loadingMaxOrderTime = true;
				this.orderService.getMaxOrderTime(order.CityId, dataUser.UserProfileB2B[0].CustomerId).subscribe(
					res => {
						this.loadingMaxOrderTime = false;
						let obj = res.Data[0];
						var currenTime = moment(moment().format('HH:mm'), 'HH:mm');
						var startDate = moment(
							order.OriginStartDate.substring(0, 10) + ' ' + order.OriginStartDate.substring(11, 16),
							'YYYY-MM-DD HH:mm'
						);
						let splittime = obj.CancelationTime.split(':');

						startDate.add(Number(splittime[0]) * -1, 'hours');
						startDate.add(Number(splittime[1]) * -1, 'minutes');
						if (isSingle) {
							if (moment(currenTime['_d']).isAfter(startDate['_d'])) {
								this.objCancelOrder.CancellationFee = Number(obj.CancelValue);
								this.objCancelOrder.AdjustmentType = obj.AdjustmentType;
								this.notifStringFee();
							}
						} else {
							if (moment(currenTime['_d']).isAfter(startDate['_d'])) {
								this.arrPriceCancelation.push(Number(obj.CancelValue));
							}
						}
						this.priceCancelation = _.sum(this.arrPriceCancelation);
					},
					err => {
						this.loadingMaxOrderTime = false;
						this.fetchPriceAdjusmentDetail(isSingle, order);
					}
				);
			}
		}
	}

	// Cancel Order
	// ============================= //
	public displayCancelOrder: boolean = false;
	public objCancelOrder = null;
	selectCancelOrder(e) {
		this.displayCancelOrder = true;
		this.objCancelOrder = {
			CancellationReasonId: e.CancellationReason,
			CancellationReason: e.CancellationReason,
			CancellationFee: 0,
			AdjustmentType: null,
			BookingOrderId: e.BookingOrderId
		};
		var elem = document.getElementById('body').setAttribute('class', 'on');
		this.fetchPriceAdjusmentDetail(true, e);
	}

	public notifFee: String = '';
	notifStringFee() {
		let _this = this;
		let cancelFee = _this.objCancelOrder && _this.objCancelOrder.CancellationFee;
		let value = _this.objCancelOrder && _this.objCancelOrder.AdjustmentType;
		_this.notifFee = `${value == 'Rupiah' ? 'Rp.' : ''}${cancelFee}${value == '%' ? '%' : ''}`;
	}

	closeCancelOrder() {
		this.displayCancelOrder = false;
		this.selectedReasonOrder = null;
		this.objCancelOrder = null;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}
	public cancelOrderBtn: boolean = false;
	cancelOrder() {
		this.cancelOrderBtn = true;
		let find = _.find(this.reasons, { value: this.selectedReasonOrder });
		if (find != undefined) {
			this.objCancelOrder['CancellationReasonId'] = find.value;
			this.objCancelOrder['CancellationReason'] = find.label;
		}
		this.orderService.putCancelOrder(this.objCancelOrder).subscribe(
			res => {
				this.cancelOrderBtn = false;
				this.closeCancelOrder();
				this.fetchReservation(this.id);
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success Cancel Order'
				});
			},
			err => {
				this.cancelOrderBtn = false;
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Failed',
					detail: 'Failed Cancel Order'
				});
			}
		);
	}
	// Fetch Reason
	// ========================================= //
	private reasons = [];
	public selectedReasonReservation = null;
	public selectedReasonOrder = null;
	fetchCancelReaseon(id) {
		this.orderService.getOrderCancelReason(id).subscribe(res => {
			this.reasons = [];
			_.map(res.Data, x => {
				let obj = { label: x.Description, value: x.ReasonId };
				this.reasons.push(obj);
			});
		});
	}

	// Cancel Reserfvation
	// ========================================= //
	selectCancelReservation(e) {
		this.objCancelOrder = {
			CancellationReasonId: e.CancellationReason,
			CancellationReason: e.CancellationReason,
			CancellationFee: 0,
			AdjustmentType: null,
			BookingOrderId: e.BookingOrderId
		};
		var elem = document.getElementById('body').setAttribute('class', 'on');
		this.fetchPriceAdjusmentDetail(true, e);
	}

	private submitButton: boolean = false;
	public displayCancelReservation: boolean = false;
	openCancelReservation() {
		this.displayCancelReservation = true;
		this.objCancelOrder = null;
		var elem = document.getElementById('body').setAttribute('class', 'on');
		this.arrPriceCancelation = [];
		_.map(this.data, x => {
			this.fetchPriceAdjusmentDetail(false, x);
		});
	}
	closeCancelReservation() {
		this.selectedReasonReservation = null;
		this.displayCancelReservation = false;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}
	public cancelReservationBtn: boolean = false;
	cancelReservation() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.cancelReservationBtn = true;
		this.displayCancelReservation = true;
		let find = _.find(this.reasons, { value: this.selectedReasonReservation });
		let obj = {
			CancellationReasonId: find.value,
			CancellationReason: find.label,
			CancellationFee: _.sum(this.arrPriceCancelation),
			ReservationId: this.dataOrderHistory.ReservationId,
			CancelByUser: dataUser.EmailCorp
		};
		if (dataUser.RoleId == 'RL-002' || dataUser.RoleId == 'RL-001') {
			obj['CancellationFee'] = 0;
		}
		this.orderService.putCancelReservation(obj).subscribe(
			res => {
				this.cancelReservationBtn = false;
				this.closeCancelReservation();
				this.fetchReservation(this.id);
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success Cancel Reservation'
				});
			},
			err => {
				this.cancelReservationBtn = false;
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Failed',
					detail: 'Failed Cancel Reservation'
				});
			}
		);
	}

	// ============================================================================== //
	// Package Options
	// ============================================================================== //

	// Fuels
	// ========================= //
	fetchFuel() {
		this.orderService.getFuel().subscribe(
			res => {
				_.map(this.dataOrderHistory.details, x => {
					let find = _.find(res.Data, { FuelSAPCode: x.Fuel });
					if (find != undefined) {
						x['FuelName'] = find.Name;
					}
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchFuel();
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchFuel();
				}
			}
		);
	}

	// Toll & Parking
	// ========================= //
	fetchTollParking() {
		this.orderService.getTollParking().subscribe(
			res => {
				_.map(this.dataOrderHistory.details, x => {
					let find = _.find(res.Data, {
						TollandParkingSAPCode: x.TollAndParking
					});
					if (find != undefined) {
						x['TollAndParkingName'] = find.Name;
					}
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchTollParking();
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchTollParking();
				}
			}
		);
	}

	// Driver
	// ========================= //
	fetchDriverRider() {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			this.orderService.getDriverRider(dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(
				res => {
					_.map(this.dataOrderHistory.details, x => {
						x['DriverOrRiderName'] = _.find(res.Data, {
							DriverorRiderSAPCode: x.DriverOrRider
						}).Name;
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchDriverRider();
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchDriverRider();
					}
				}
			);
		}
	}

	// Driver Spesification
	// =========================== //
	fetchDriverSpesification() {
		this.orderService.getDriverSpesification().subscribe(
			res => {
				// console.log(res);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDriverSpesification();
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchDriverSpesification();
				}
			}
		);
	}

	// Chanel Type
	// =========================== //
	fetchChanel() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (dataUser != null) {
			this.orderService.getChanel().subscribe(
				res => {},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchChanel();
						});
					}
				}
			);
		}
	}

	// Fetch User Detail
	fetchUserDetail(obj) {
		this.orderService.getDetailUser(obj.CreatedBy).subscribe(
			res => {
				obj.CreatedName = res.Data.FirstName + ' ' + res.Data.LastName;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchUserDetail(obj);
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchUserDetail(obj);
				}
			}
		);
	}
}
