function($scope) {
    var c = this;

    // State
    c.step = 1;
    c.jobType = null;
    c.params = {};
    c.environments = [];
    c.submitting = false;
    c.error = null;
    c.jobResult = null;

    // Load environments on widget init
    c.server.get({ action: 'getEnvironments' }).then(function(r) {
        c.environments = r.data.environments || [];
    });

    c.selectJob = function(type) {
        c.jobType = type;
        c.params = {};
    };

    c.nextStep = function() {
        c.error = null;
        c.step++;
    };

    c.prevStep = function() {
        c.error = null;
        c.step--;
    };

    c.onEnvChange = function() {
        // nothing extra needed — ng-model handles the binding
    };

    c.isStep2Valid = function() {
        if (!c.params.environmentDetailId) return false;
        if (c.jobType === 'msix' && !c.params.application) return false;
        if (c.jobType === 'intune' && (!c.params.displayName || !c.params.installCommand)) return false;
        return true;
    };

    c.jobTypeLabel = function() {
        var labels = { discovery: 'Discovery', msix: 'MSIX Builder', intune: 'Intune Publishing' };
        return labels[c.jobType] || c.jobType;
    };

    c.selectedEnvName = function() {
        var env = c.environments.filter(function(e) {
            return e.id === c.params.environmentDetailId;
        })[0];
        return env ? env.name : c.params.environmentDetailId;
    };

    c.reviewParams = function() {
        var review = {};
        if (c.jobType === 'discovery') {
            review['Job Type'] = 'Discovery';
        }
        if (c.jobType === 'msix') {
            review['Application'] = c.params.application || '—';
            if (c.params.arguments) review['Arguments'] = c.params.arguments;
            if (c.params.installOrder) review['Install Order'] = c.params.installOrder;
            if (c.params.timeoutInHours) review['Timeout (hours)'] = c.params.timeoutInHours;
            review['Create App Attach'] = c.params.createAppAttach ? 'Yes' : 'No';
            review['CimFS for App Attach'] = c.params.cimfsForAppAttach ? 'Yes' : 'No';
        }
        if (c.jobType === 'intune') {
            review['Display Name'] = c.params.displayName || '—';
            if (c.params.description) review['Description'] = c.params.description;
            review['Install Command'] = c.params.installCommand || '—';
            review['Send to Auto Launch'] = c.params.sendToAutoLaunch ? 'Yes' : 'No';
        }
        return review;
    };

    c.submit = function() {
        c.submitting = true;
        c.error = null;

        c.server.get({
            action: 'submitJob',
            jobType: c.jobType,
            params: c.params
        }).then(function(r) {
            c.submitting = false;
            c.jobResult = r.data.result;
            c.step = 4;
        }).catch(function() {
            c.submitting = false;
            c.error = 'An unexpected error occurred. Please try again.';
        });
    };

    c.reset = function() {
        c.step = 1;
        c.jobType = null;
        c.params = {};
        c.submitting = false;
        c.error = null;
        c.jobResult = null;
    };
}
