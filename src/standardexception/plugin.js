import {hasList} from '../common/common';
import {toggleWidgetState} from '../common/common';

(function () {
    let title = 'standardexception';
    let block = [
        title,
        'exceptionlist'
    ];

    let blockNestedExceptions = (editor, event, names) => {
        let sender = event.sender;
        let content = sender.editables.content.$;
        let widgets = [];

        names.forEach(function (name) {
            let widget = editor.commands[name];

            widgets.push(widget);
        });

        toggleWidgetState(widgets, content);
    };

    CKEDITOR.dtd.$editable.span = 1;
    CKEDITOR.plugins.add(
        title, {
            requires: 'widget',
            icons: title,
            init: (editor) => {
                editor.widgets.add(
                    title, {
                        button: 'Add a standard exception',

                        template: `<div class="exception">
                            <p>
                                <span class="run_in">
                                    <span class="bold">Exception:</span>
                                </span>Exception content...
                            </p>
                        </div>`,

                        editables: {
                            content: {
                                selector: '.exception p'
                            },
                            exceptionContent: {
                                selector: '.exception_content'
                            }
                        },

                        allowedContent: 'div(!exception); span(!run_in);',
                        requiredContent: 'div(exception); span(run_in);',

                        // function fires when initially entering current widget's editable area
                        edit: (event) => {
                            blockNestedExceptions(editor, event, block);
                        },

                        // function fires when processing imported widget's editable area
                        data: (event) => {
                            blockNestedExceptions(editor, event, block);
                        },

                        upcast: (element) => {
                            return (element.name === 'div' && element.hasClass('exception') && !hasList(element));
                        }
                    }
                )
            }

        }
    );
})();
