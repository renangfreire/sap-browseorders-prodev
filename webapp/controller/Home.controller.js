sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/lab2dev/browseordersprodev/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    'sap/ui/core/Fragment',
    'sap/m/GroupHeaderListItem',
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "com/lab2dev/browseordersprodev/model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, JSONModel,Filter, FilterOperator, Fragment, GroupHeaderListItem, Sorter, MessageBox,formatter) {
        "use strict";
        
        return Controller.extend("com.lab2dev.browseordersprodev.controller.Home", {
            formatter: formatter,
            onInit: function () {
                this.getView().setBusy(true)
                
                this._oSorterPaths = {
                    OrderMonth: "OrderDate",
                    ShippedDate: "ShippedDate",
                    CustomerGroup: "ShipName"
                }

                this.oRouter = this.getOwnerComponent().getRouter();
                const orders = models.getAllOrders();

                orders
                    .then((aOrder) => {
                        const oModel = new JSONModel({
                            Orders: aOrder,
                            count: this._countItems(aOrder),
                            viewDetails: {
                                allCustomers: this._getAllCustomers(aOrder),
                                descendingEnabled: false
                            }
                        }) 
                        this.getView().setBusy(false)
                        this.getView().setModel(oModel)
                    })
                    .catch((sError) => {
                        MessageBox.warning("Error getOrder" + sError)
                    })
            },
            onNavToOrderDetails: function(oEvent){
                const sOrderPath = oEvent.getSource().getBindingContextPath().split('/')[2]
                
                const orderID = this.getView().getModel().getData().Orders[sOrderPath].OrderID

                this.oRouter.navTo("OrderDetail", {orderID, query: {tab: "shipping"}})
            },
            onSearch: function(oEvent){
                const getModel = this.getView().getModel()
                const oData = getModel.getData();          
                const aFilters = []
                const sQuery = oEvent.getParameter("newValue")

                if(sQuery && sQuery.length > 0){
                    const filter = new Filter({
                        filters: [
                            new Filter("ShipName", FilterOperator.Contains, sQuery),
                            new Filter("OrderID", (oValue) => oValue.toString().includes(sQuery))
                        ]
                    })
                    aFilters.push(filter)
                }

                const oList = this.byId("OrdersTable")
                const oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, "Application")

                getModel.setData({...oData, count: oBinding.getCount()})
              },
            handleOpenDialog: function(oEvent) {
                const oView = this.getView();
                if(!this._pDialog){
                    this._pDialog = Fragment.load({
                        name: "com.lab2dev.browseordersprodev.view.fragments.OrderSettingsDialog",
                        controller: this
                    })
                }

                const sId = oEvent.getParameter("id")
                let sPage
                if(sId.includes("sort")){
                    sPage = "sort"
                } 
                if(sId.includes("filter")){
                    sPage = "filter"
                }
                if(sId.includes("group")){
                    sPage = 'group'
                }

                this._pDialog.then((oDialog) => {
                    oView.insertDependent(oDialog) // Passando MODEL pro FRAGMENT
                    oDialog.open(sPage);
                });
            },
            _countItems(aOrders){
                return aOrders.length
            },
            _getAllCustomers(aOrder){
                const aAllCustomersRepeated = aOrder.map(order => JSON.stringify({CustomerName: order.ShipName, CustomerID: order.CustomerID}))
                const aCustomersNoRepeated = [...new Set(aAllCustomersRepeated)].map(objectStringify => JSON.parse(objectStringify))

                return aCustomersNoRepeated
            },
            handleConfirm: function(oEvent){
                const oParams = oEvent.getParameters();

                const oList = this.byId("OrdersTable")
                this._oBinding = oList.getBinding("items")

                this._filterOrders(oParams.filterCompoundKeys)
                this._sortOrders(oParams.sortItem?.getProperty("key"), 
                                 oParams.sortDescending, 
                                 oParams.groupItem?.getProperty("key"), 
                                 oParams.groupDescending)
            },
            _filterOrders: function(sQuery){
                const getModel = this.getView().getModel()
                const oData = getModel.getData();          
                const aFilters = []

                if(sQuery){
                    if(sQuery.OrderStatus){
                        Object.keys(sQuery.OrderStatus).forEach(query => {
                            const filter = new Filter({
                                test: (oValue) => {
                                    const state = formatter.shipStatusState(oValue.OrderDate, oValue.ShippedDate)
                                    return state === query
                                }
                            })
                            aFilters.push(filter)
                        })
                    }

                if(sQuery.Customer){
                        Object.keys(sQuery.Customer).forEach(query => {
                            const filter = new Filter("CustomerID", FilterOperator.Contains, query)
                            aFilters.push(filter)
                        })
                    }
                   
                }

                const oList = this.byId("OrdersTable")
                const oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, "Application")

                getModel.setData({...oData, count: oBinding.getCount()})
            },
            _sortOrders: function(sQuery, sortDescending, groupQuery, groupDescending){
                let oSorter
                if(sQuery === "StatusOrder" || groupQuery === "StatusOrder"){
                     oSorter = new Sorter({
                        path: "",
                        descending: groupDescending || sortDescending, 
                        group: groupQuery ?  this?._oGroupFunctions[groupQuery] : false,
                    })

                    oSorter.fnCompare = function(beforeValue, actualValue){
                        const nDaysInTransportA = formatter.calcDaysInTransport(actualValue.OrderDate, actualValue.ShippedDate)
                        const nDaysInTransportB = formatter.calcDaysInTransport(beforeValue.OrderDate, beforeValue.ShippedDate)
                        
                        if(nDaysInTransportA > nDaysInTransportB) return -1
                        if(nDaysInTransportA == nDaysInTransportB) return 0
                        if(nDaysInTransportA < nDaysInTransportB) return 1
                    }
                } else {
                    oSorter = new Sorter({
                        path: groupQuery ? this._oSorterPaths[groupQuery] : sQuery,
                        descending: groupDescending || sortDescending,
                        group: groupQuery ?  this?._oGroupFunctions[groupQuery] : false
                    })
                }

                this._oBinding.sort(oSorter, "Application")
            },
            _oGroupFunctions: {
                CustomerGroup: function(oContext){
                    const CustomerName = oContext.getProperty("ShipName")

                    return {
                        key: CustomerName,
                        name: CustomerName
                    }
                },
                OrderMonth: function(oContext){
                    const orderDate = new Date(oContext.getProperty("OrderDate"))
                    const nOrderMonth = orderDate.getMonth() + 1;
                    const sOrderMonthName = new Date(orderDate).toLocaleDateString('pt-BR', {month: 'long'})
                    const nOrderYear = orderDate.getFullYear()

                    return {
                        name: nOrderYear + '-' + nOrderMonth,
                        key: `Ordered in ${sOrderMonthName}, ${nOrderYear}` 
                    }
                },
                ShippedDate: function(oContext){
                    const shippedDate = new Date(oContext.getProperty("ShippedDate"))

                    if(shippedDate === null) {
                        return {
                            key: "null",
                            value: "Not Shipped"
                        }
                    }

                    const nShippedMonth = shippedDate.getMonth() + 1;
                    const sShippedMonthName = new Date(shippedDate).toLocaleDateString('pt-BR', {month: 'long'})
                    const nShippedYear = shippedDate.getFullYear()

                    return {
                        name: nShippedYear + '-' + nShippedMonth,
                        key: `Shipped in ${sShippedMonthName}, ${nShippedYear}` 
                    }
                },
                StatusOrder: function(oContext){
                    const sOrderDate = oContext.getProperty("OrderDate")
                    const sShippedDate = oContext.getProperty("ShippedDate")
                    
                    const nDaysInTransport = formatter.calcDaysInTransport(sOrderDate, sShippedDate)
                    // Refatorar o code abaixo dps
                    let key, name

                    if(nDaysInTransport > 14){
                        name = "Error"
                        key = "Too long"
                     }
                    else if(nDaysInTransport > 7){
                        name = "Warning"
                        key = "Urgent"
                    } else{
                        name =  "Success"
                        key = "In time"
                    }
                    
                    return {
                        key,
                        name
                    }
                    
                },
            },
            _getGroupHeader: function(oGroup) {
                return new GroupHeaderListItem({
                    title : oGroup.key
                    }
                );
            }
    })
});
