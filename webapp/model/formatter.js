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
            }
            
    };
});