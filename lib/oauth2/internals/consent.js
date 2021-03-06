const AuthorizationError = require('oauth2orize').AuthorizationError;
const grants = require('../../db/grants');

/*
    Handle the consent decision
*/

module.exports.decisionFunction = function (req, done) {
    
    // if the user cancelled / rejected consent, return an error
    if (req.body.cancel) {
        return done(new AuthorizationError('User denied consent', 'access_denied'));
    }

    // scope should be an array
    let scope = req.body.scope && req.body.scope.split(',');

    // the user consented to certain scopes, for a certain client, so save the grant record
    grants.upsert(req.user.user_id, req.oauth2.client.client_id, scope, function(err, grant) {
        // respond with granted scopes
        return done(null, { scope: scope });
    });
};

/*
    Show the consent prompt
*/

module.exports.showConsent = function(req, res, next) {
    let friendlyScopes = [];
    let scopes = req.oauth2.req.scope;

    if (scopes.indexOf('profile') > -1) {
        friendlyScopes.push('User profile');
    }

    if (scopes.indexOf('email') > -1) {
        friendlyScopes.push('Email address');
    }

    if (scopes.indexOf('phone') > -1) {
        friendlyScopes.push('Phone number');
    }

    if (scopes.indexOf('address') > -1) {
        friendlyScopes.push('Address');
    }

    if (scopes.indexOf('offline_access') > -1) {
        friendlyScopes.push('Offline access');
    }

    res.render('consent', {
        transactionID: req.oauth2.transactionID, 
        user: req.user,
        client: req.oauth2.client,
        title: 'Consent',
        scope: req.oauth2.req.scope,
        friendlyScopes: friendlyScopes,
        redirectURI: req.oauth2.req.redirectURI
    });
};
