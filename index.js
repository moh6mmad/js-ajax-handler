
export default function (options) {

    if (options.alerts){        
        jQuery('body').append(`
        <div style="display:none" class="jah-notification jah-notification-success" id="jah-success-message-global"></div>
        <div style="display:none" class="jah-notification jah-notification-error" id="jah-error-message-global"></div>
        `);
    }

    $(document).on('click', '.jah-notification-close', function (e) {
        $(`body`).find(`.jah-notification`).hide();
    });

    $(document).on('submit', 'form.jah-ajax-form', function (e) {
        jahGlobalAjaxHandler($(this), e);
    });

    function jahDisplayAlertMessage(message, alert, timer = 4000) {
        timer = options.alertTimers ? options.alertTimers : 4000;
        $(`#jah-${alert}-message-global`).html(message + '<div class="jah-notification-close">×</div>').fadeIn().delay(timer).fadeOut();
    }

    function jahGlobalAjaxErrorMessage(message, timer = 3000) {
        jahDisplayAlertMessage(message, 'error', timer);
    }

    function jahGlobalAjaxSuccessMessage(message, timer = 3000) {
        jahDisplayAlertMessage(message, 'success', timer);
    }

    function jahGlobalAjaxHandler(theForm, e) {

        if (options.lockform) {
            theForm.addClass('jah-p-relative');
        }

        const originalValue = theForm.find('*[type="submit"]').html();

        $('#jah-error-message-global').hide();

        const formAction = theForm.children('input[name="action"]').val();
        $(`#success_message-${formAction}`).hide();

        if (e !== null) {
            e.preventDefault();
        }

        if (theForm.data('confirmation-message')) {

            if (!confirm(theForm.data('confirmation-message'))) {

                theForm.removeClass('jah-p-relative');
                return;
            }
        }

        if (theForm.data('validator-function')) {

            let validatorFunction = theForm.data('validator-function'),
                validatorRes = eval(validatorFunction + '();');

            if (validatorRes == false) {

                if (theForm.data('message-invalid')) {
                    alert(theForm.data('message-invalid'));
                }

                theForm.removeClass('jah-p-relative');
                return validatorRes;
            }
        }

        if (options.loader) {
            if (!$('body').find(`#loader-${formAction}`).length) {

                $(theForm).append(`<div class="jah-loader" id="loader-global"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`);

            } else {

                $(`#loader-${formAction}`).show();

            }
        }

        let formData = theForm.serialize();

        if (!formData.length) {

            let formClass = theForm.attr('id');
            formData = jQuery(`#${formClass}`).serialize();

        }

        if (theForm.data('action')) {

            formData += '&action=' + theForm.data('action');
        }

        theForm.find('*[type="submit"]').html('...');

        $.ajax({
            url: theForm.attr('action'),
            type: "post",
            data: formData,
            success: function (response) {


                $('body').find('#loader-global').remove();
                $(`#loader-${formAction}`).fadeOut();

                if ((response.messages || response.message) && response.status) {

                    if (response.messages) {

                        jQuery.each(response.messages, function (id, message) {

                            if (response.status === 'success') {

                                jahDisplayAlertMessage(message, 'success');


                            } else if (response.status === 'error') {
                                jahDisplayAlertMessage(message, 'error');


                            }
                        });

                    } else if (response.message) {

                        if (response.status === 'success') {

                            jahDisplayAlertMessage(response.message, 'success');


                        } else if (response.status === 'error') {
                            jahDisplayAlertMessage(response.message, 'error');


                        }
                    }

                } else {
                    if (theForm.data('message-success')) {

                        jahDisplayAlertMessage(response.message, 'success');

                    } else if ($('body').find(`#success_message-${formAction}`).length) {

                        $(`#success_message-${formAction}`)
                            .fadeIn().delay(5000).fadeOut();

                    }
                }

                if (theForm.data('success-function')) {
                    let callBackFunction = theForm.data('success-function');
                    return eval(callBackFunction + '(response);');
                }

                if (theForm.data('redirect') && response.url) {
                    window.location.href = response.url;
                    return false;

                }

                theForm.find('*[type="submit"]').html(originalValue);
                theForm.removeClass('jah-p-relative');

            }
        })
            .fail(function (result) {

                $('body').find('#loader-global').remove();

                if (theForm.data('error-function')) {

                    let callBackErrorFunction = theForm.data('error-function');
                    theForm.removeClass('jah-p-relative');
                    return eval(callBackErrorFunction + '(result);');

                } else {

                    console.log(result);
                    $(`#loader-${formAction}`).fadeOut();
                    alert('ERROR-something went wrong. Please check console or try again.');

                }

                theForm.removeClass('jah-p-relative');

            });
    }


}
