jQuery(document).ready(function ($) {
    const { __ } = wp.i18n;

    function healthy_test() {
        $('#healthy-test-result').text(__('Testing...', 'healthy'));

        $.get(HealthyConfig.checkUrl, function (response) {
            $('#healthy-test-result').text(JSON.stringify(response));
        }).fail(function () {
            $('#healthy-test-result').text(__('Error occurred while testing.', 'healthy'));
        });
    }

    $('#healthy-test-button').click(healthy_test);
    healthy_test();
});