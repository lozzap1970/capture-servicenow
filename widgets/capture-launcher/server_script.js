(function() {
    if (!input || !input.action) { return; }
    var action = input.action;
    // TODO: update scope prefix to match your app scope shown in Studio
    var api = new x_973109_capture_0.CaptureAPIClient();

    if (action === 'getEnvironments') {
        try {
            var result = api.getEnvironmentDetails();
            if (result.success) {
                // Map response array to { id, name } — adjust field names to match actual API response
                data.environments = (result.body || []).map(function(env) {
                    return {
                        id: env.id || env.environmentDetailId,
                        name: env.name || env.environmentName || env.id
                    };
                });
            } else {
                data.environments = [];
                gs.error('CaptureAPIClient: getEnvironmentDetails returned ' + result.status);
            }
        } catch (e) {
            data.environments = [];
            gs.error('CaptureAPIClient: getEnvironmentDetails exception: ' + e.message);
        }
        return;
    }

    if (action === 'submitJob') {
        var jobType = input.jobType;
        var params  = input.params;
        var envId   = params.environmentDetailId;

        try {
            var response;

            if (jobType === 'discovery') {
                response = api.createDiscoveryJob(envId);

            } else if (jobType === 'msix') {
                response = api.createMsixPackageBuilderJob(envId, {
                    application:        params.application,
                    arguments:          params.arguments || '',
                    installOrder:       parseInt(params.installOrder) || 1,
                    timeoutInHours:     parseInt(params.timeoutInHours) || 2,
                    createAppAttach:    !!params.createAppAttach,
                    cimfsForAppAttach:  !!params.cimfsForAppAttach
                });

            } else if (jobType === 'intune') {
                response = api.createPackageDeploymentJob(envId, {
                    displayName:      params.displayName,
                    description:      params.description || '',
                    installCommand:   params.installCommand,
                    sendToAutoLaunch: !!params.sendToAutoLaunch
                });

            } else {
                data.result = { success: false, message: 'Unknown job type: ' + jobType };
                return;
            }

            if (response.success) {
                var jobId = (response.body && (response.body.jobId || response.body.id)) || null;
                data.result = {
                    success: true,
                    message: 'Your job has been queued and will start shortly.',
                    jobId: jobId
                };
            } else {
                var errMsg = (response.body && response.body.message) || ('HTTP ' + response.status);
                data.result = {
                    success: false,
                    message: 'The Capture API returned an error: ' + errMsg
                };
            }
        } catch (e) {
            gs.error('CaptureAPIClient: submitJob exception: ' + e.message);
            data.result = {
                success: false,
                message: 'Failed to connect to Capture API: ' + e.message
            };
        }
    }
})();
