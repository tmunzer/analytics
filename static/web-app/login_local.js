var login = angular.module('login', [
    'ngMaterial', 'ngSanitize', 'pascalprecht.translate'
]);

login
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue")
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    }).config(function ($translateProvider) {
    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider
        .translations('en', en)
        .translations('fr', fr)
        .registerAvailableLanguageKeys(['en', 'fr'], {
            'en_*': 'en',
            'fr_*': 'fr'
        })
        .determinePreferredLanguage()
        .fallbackLanguage('en')
        .useSanitizeValueStrategy('sanitize');

});

login.controller('LoginCtrl', function ($scope) {

});

