sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/model/odata/v2/ODataModel"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device, ODataModel) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            getOModelData: function() {
                const oModel = new ODataModel("/northwind/northwind.svc/")

                return new Promise(function(resolve, reject) {
                    oModel.attachMetadataLoaded(() => {
                        resolve(oModel)
                    })

                    oModel.attachMetadataFailed(() => {
                        reject("Serviço indisponível")
                    })
                })
            },
            getAllOrders: function() {
                const oDataModel = this.getOModelData();

                return new Promise(function(resolve, reject) {
                        oDataModel.then(function(oModel){
                            oModel.read("/Orders", {
                                success: (oData) => {
                                    resolve(oData)
                                },
                                error: (oError) => {
                                    reject(oError)
                                }
                            })
                        })
                        .catch(function(oError) {
                            reject(oError)
                        })                                           
                })
            },
            getOrderData: function(orderID){
                const oDataModel = this.getOModelData();

                return new Promise(function(resolve, reject) {
                    // Não consigo extender a request no Orders dessa forma, Perguntar ao joão!
                    oDataModel.then(function(oModel) {
                        oModel.read(`/Orders(10248)`, {
                            success: (oData) => {
                                oData.expand
                                resolve(oData)
                            },
                            error: (oError) => {
                                reject(oError)
                            }
                        })
                    })
                    .catch(function(oError) {
                        reject(oError)
                    })
                })
            }
    };
});