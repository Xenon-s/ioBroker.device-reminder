function loadUser(settings, onChange) {

    $('.value').each(function () {
        const $key = $(this);
        const id = $key.attr('id');
        if ($key.attr('type') === 'checkbox') {
            // do not call onChange direct, because onChange could expect some arguments
            $key.prop('checked', settings[id])
                .on('change', () => onChange(), $('.btn-save, .btn-save-close').fadeIn());
            ;
        }
        else {
            // do not call onChange direct, because onChange could expect some arguments
            $key.val(settings[id])
                .on('change', () => onChange(), $('.btn-save, .btn-save-close').fadeIn())
                .on('keyup', () => onChange(), $('.btn-save, .btn-save-close').fadeIn())
                ;
        };
    });
};