sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/lab2dev/browseordersprodev/model/models",
    "sap/ui/model/json/JSONModel",
    "com/lab2dev/browseordersprodev/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, JSONModel, formatter) {
        "use strict";
        
        return Controller.extend("com.lab2dev.browseordersprodev.controller.OrderDetail", {
            formatter: formatter,
            onInit: function () {
                this._aValidKeys = ["processor", "shipping"]

                this.oRouter = this.getOwnerComponent().getRouter()

                this.oRouter.getRoute("OrderDetail").attachPatternMatched(this._onRouteMatched, this)                
            },
            _onRouteMatched: function(oEvent){
                const oArgs = oEvent.getParameter("arguments")

                const order = models.getOrderData(oArgs.orderID);

                const oQuery = oArgs["?query"]
                let selectedTab

                debugger

                if(oQuery.tab && this._aValidKeys.findIndex((el) => el === oQuery.tab) >= 0){
                    selectedTab = oQuery.tab
                } else{
                    this.oRouter.navTo("OrderDetail", {
                        orderID: oArgs.orderID,
                        query: {
                            tab: "shipping"
                        }
                    })
                }

                order
                    .then((oOrder) => {
                        const oModel = new JSONModel({
                            ...oOrder,
                            viewDetails: {
                                count: this._countItems(oOrder.Order_Details),
                                currencyCode: "EUR",
                                totalOrderAmount: this._sumTotalOrder(oOrder.Order_Details),
                                selectedTab
                            }
                        }) 
                        this.getView().setModel(oModel)

                        this.oRouter().getTargets().display(oQuery.tab)
                    })
                    .catch((sError) => {
                        console.log("Error getOrder" + sError)
                    })

            },
            _countItems(oOrderDetails){
                return oOrderDetails.results.length
            },
            _sumTotalOrder: function(oOrderDetails){
                const totalAmount = oOrderDetails.results.reduce((acc, atualValue) => {
                    const productTotal = atualValue.Quantity * +atualValue.UnitPrice

                    return acc + productTotal
                }, 0)

                return totalAmount
            },
            onListSelect: function(oEvent){

                
            },
            onNavBack: function(){
                this.oRouter.navTo("RouteHome")
            }
        });
    });
