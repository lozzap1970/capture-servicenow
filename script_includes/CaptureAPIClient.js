var CaptureAPIClient = Class.create();
CaptureAPIClient.prototype = {
    initialize: function() {
        this.baseUrl = 'https://athena-api.getaccesscapture.com';
        this.oauthProfileName = 'Capture API OAuth'; // name of your OAuth provider record in ServiceNow
    },

    _getToken: function() {
        var oAuthClient = new GlideOAuthClient();
        var tokenRequest = new GlideOAuthClientRequest();
        tokenRequest.setGrantType('client_credentials');
        var oAuthResponse = oAuthClient.requestToken(this.oauthProfileName, tokenRequest);
        if (oAuthResponse.getErrorCode()) {
            throw new Error('Token error: ' + oAuthResponse.getErrorMessage());
        }
        return oAuthResponse.getToken().getAccessToken();
    },

    _call: function(method, path, body) {
        var token = this._getToken();
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint(this.baseUrl + path);
        rm.setHttpMethod(method);
        rm.setRequestHeader('Authorization', 'Bearer ' + token);
        rm.setRequestHeader('Content-Type', 'application/json');
        rm.setRequestHeader('Accept', 'application/json');
        if (body) rm.setRequestBody(JSON.stringify(body));
        var response = rm.execute();
        var statusCode = response.getStatusCode();
        var responseBody = response.getBody();
        return {
            status: statusCode,
            success: statusCode >= 200 && statusCode < 300,
            body: responseBody ? JSON.parse(responseBody) : {}
        };
    },

    getEnvironmentDetails: function() {
        return this._call('GET', '/api/Environment/EnvironmentDetails', null);
    },

    createDiscoveryJob: function(environmentDetailId) {
        return this._call('POST',
            '/api/Environment/EnvironmentDetails/' + environmentDetailId + '/CreateDiscoveryJob',
            {}
        );
    },

    createMsixPackageBuilderJob: function(environmentDetailId, params) {
        // params: { application, arguments, installOrder, timeoutInHours, cimfsForAppAttach, createAppAttach }
        return this._call('POST',
            '/api/Environment/EnvironmentDetails/' + environmentDetailId + '/CreateMsixPackageBuilderJob',
            params
        );
    },

    createPackageDeploymentJob: function(environmentDetailId, params) {
        // params: { displayName, description, installCommand, logoUrl, sendToAutoLaunch }
        return this._call('POST',
            '/api/Environment/EnvironmentDetails/' + environmentDetailId + '/CreatePackageDeploymentJob',
            params
        );
    },

    type: 'CaptureAPIClient'
};
