import {hasList} from '../common/common';
import {toggleWidgetState} from '../common/common';

(function () {
    let blockNestedExceptionList = (editor, event, name) => {
        // running this code only when "exceptionlist" widget is initiated
        if (editor.commands.exceptionlist !== undefined) {
            let sender = event.sender;
            let content = sender.editables.content.$;
            let widget = editor.commands[name];

            toggleWidgetState(widget, content);
        }
    };

    CKEDITOR.dtd.$editable.span = 1;
    CKEDITOR.plugins.add(
        'standardexception', {
            requires: 'widget',
            icons: 'standardexception',
            init: (editor) => {
                editor.widgets.add(
                    'standardexception', {
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
                            // disable "Exception List" button when editing "Regular Exception"
                            blockNestedExceptionList(editor, event, 'exceptionlist');
                        },

                        upcast: (element) => {
                            return element.name === 'div' && element.hasClass('exception') && !hasList(element);
                        }
                    }
                )
            }
        }
    )
})();
