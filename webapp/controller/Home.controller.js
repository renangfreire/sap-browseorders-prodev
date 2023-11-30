sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/lab2dev/browseordersprodev/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    'sap/ui/core/Fragment',
    "com/lab2dev/browseordersprodev/model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, JSONModel,Filter, FilterOperator, Fragment, formatter) {
        "use strict";
        
        return Controller.extend("com.lab2dev.browseordersprodev.controller.Home", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();

                const orders = models.getAllOrders();

                orders
                    .then((aOrder) => {
                        const oModel = new JSONModel({
                            Orders: aOrder,
                            count: this._countItems(aOrder),
                            viewDetails: {
                                allCustomers: this._getAllCustomers(aOrder),
                            }
                        }) 
                        this.getView().setModel(oModel)
                    })
                    .catch((sError) => {
                        console.log("Error getOrder" + sError)
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
                            new Filter("OrderID", FilterOperator.EQ, sQuery)
                        ]
                    })
                    aFilters.push(filter)
                }

                const oList = this.byId("OrdersTable")
                const oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, "Application")

                getModel.setData({...oData, count: oBinding.getCount()})
              },
            handleOpenDialog: function() {
                const oView = this.getView();
                if(!this._pDialog){
                    this._pDialog = Fragment.load({
                        name: "com.lab2dev.browseordersprodev.view.fragments.OrderSettingsDialog",
                        controller: this
                    })
                }
                this._pDialog.then((oDialog) => {
                    oView.insertDependent(oDialog) // Passando MODEL pro FRAGMENT
                    oDialog.open();
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
                if(Object.keys(oParams.filterKeys).length >= 0){
                    this._filterOrders(Object.keys(oParams.filterKeys))
                }
            },
            _filterOrders: function(sQuery){
                const getModel = this.getView().getModel()
                const oData = getModel.getData();          
                const aFilters = []

                if(sQuery && sQuery.length > 0){
                    sQuery.forEach(query => {
                        const filter = new Filter("CustomerID", FilterOperator.Contains, query)
                        aFilters.push(filter)
                    })
                }

                const oList = this.byId("OrdersTable")
                const oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, "Application")

                getModel.setData({...oData, count: oBinding.getCount()})
            }
        });
    });
