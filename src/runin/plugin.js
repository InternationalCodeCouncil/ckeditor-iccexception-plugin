(function () {
    CKEDITOR.dtd.$editable.span = 1
    CKEDITOR.plugins.add(
        'runin', {
            requires: 'widget',
            icons: 'runin',
            init: (editor) => {
                editor.widgets.add(
                    'runin', {
                        button: 'Add a run-in',

                        template: `<span class="run_in">
                            <span class="bold">Exception:</span>
                        </span>`,

                        editables: {
                            content: {
                                selector: '.bold'
                            }
                        },

                        requiredContent: 'span(run_in)',

                        upcast: (element) => {
                            return element.name === 'span' && element.hasClass('run_in');
                        }
                    }
                )
            }
        }
    )
})();
