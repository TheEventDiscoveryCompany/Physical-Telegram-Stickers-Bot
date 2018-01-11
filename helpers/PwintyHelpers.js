var axios = require('axios');

module.exports = {
    apiUrl: ((process.env.PWINTY_ENV == 'live') ? 'https://api.pwinty.com/v2.5/' : 'https://sandbox.pwinty.com/v2.5/'),

    createOrder: function() {
        return module.exports.sendPwintyRequest("Orders", {
            "countryCode": "US"
        });
    },

    sendPwintyRequest: function(endpoint, requestObj) {
        var url = module.exports.apiUrl + endpoint;

        return new Promise((resolve, reject) => {
            axios.post(url, requestObj, {
                headers: {
                    "X-Pwinty-MerchantId": process.env.PWINTY_MERCHANT_ID,
                    "X-Pwinty-REST-API-Key": process.env.PWINTY_API_KEY
                }
            }).then(response => {
                console.log('Pwinty Request sent');
                resolve(response);
            }).catch(err => {
                console.log('Error :', err);
                reject(err);
            });
        });
    }
};