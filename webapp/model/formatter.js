sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/date/UI5Date",
    "sap/ui/core/Locale",
], 
    function (DateFormat, UI5Date, Locale) {
        "use strict";

        return {
            formatDateLong: function (date) {
                // USAR O i18n aqui no LOCALE...
                const oLocale = new Locale("pt-BR")
                const oData = UI5Date.getInstance(date)

                const oDate = DateFormat.getDateTimeInstance({format: "yMMMd"}, oLocale).format(oData)

               return oDate
                
            },
            formatDate: function(date){
                const oLocale = new Locale("pt-BR")
                const oData = UI5Date.getInstance(date)

                return DateFormat.getDateTimeInstance({format: "yMMdd"}, oLocale).format(oData)
            },
            shipStatusText:  function(oOrderDate, oShippedDate){
                // Adicionar a condição para os dias no i18n e adicionar o texto de retorno no i18n

                    if(oShippedDate === "null"){
                        return "None"
                    }

                    oShippedDate = new Date(oShippedDate)
                    oOrderDate = new Date(oOrderDate)
    
                    const nDaysInTransport = new Date(oShippedDate.getTime() - oOrderDate.getTime()).getDate()
    
                    if(nDaysInTransport > 14){
                        return "Too late"
                    }
                    if(nDaysInTransport > 7){
                        return "Urgent"
                    }
                    return "In time"
                
            },
            shipStatusState: function(oOrderDate, oShippedDate){
                if(typeof oShippedDate === "null"){
                    return "None"
                }

                oShippedDate = new Date(oShippedDate)
                oOrderDate = new Date(oOrderDate)

                const nDaysInTransport = new Date(oShippedDate.getTime() - oOrderDate.getTime()).getDate()

                if(nDaysInTransport > 14){
                    return "Error"
                }
                if(nDaysInTransport > 7){
                    return "Warning"
                }
                return "Success"
            }
            
    };
});