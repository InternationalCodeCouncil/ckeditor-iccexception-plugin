import {hasList} from '../common/common';
import {toggleWidgetState} from '../common/common';

// Set caret position easily in jQuery
// Written by and Copyright of Luke Morton, 2011
// Licensed under MIT
(function ($) {
    // Behind the scenes method deals with browser
    // idiosyncrasies and such
    $.caretTo = function (el, index) {
        if (el.createTextRange) {
            var range = el.createTextRange();
            range.move("character", index);
            range.select();
        } else if (el.selectionStart != null) {
            el.focus();
            el.setSelectionRange(index, index);
        }
    };

    // The following methods are queued under fx for more
    // flexibility when combining with $.fn.delay() and
    // jQuery effects.

    // Set caret to a particular index
    $.fn.caretTo = function (index, offset) {
        return this.queue(function (next) {
            if (isNaN(index)) {
                var i = $(this).val().indexOf(index);

                if (offset === true) {
                    i += index.length;
                } else if (offset) {
                    i += offset;
                }

                $.caretTo(this, i);
            } else {
                $.caretTo(this, index);
            }

            next();
        });
    };

    // Set caret to beginning of an element
    $.fn.caretToStart = function () {
        return this.caretTo(0);
    };

    // Set caret to the end of an element
    $.fn.caretToEnd = function () {
        return this.queue(function (next) {
            $.caretTo(this, $(this).val().length);
            next();
        });
    };
}(jQuery));

(function () {
    let title = 'exceptionlist';
    let block = [
        title,
        'standardexception'
    ];
    let end = 12;

    let offsetCaret = function (win, charCount) {
        var sel = win.getSelection();
        var range;

        if (sel.rangeCount > 0) {
            var textNode = sel.focusNode;
            var newOffset = sel.focusOffset + charCount;

            sel.collapse(textNode, Math.min(textNode.length, newOffset));
        }
    };

    function makeUnselectable(node) {
        if (node.nodeType == 1) {
            node.setAttribute('unselectable', 'on');
            node.setAttribute('disabled', 'disabled');
        }
        var child = node.firstChild;
        while (child) {
            makeUnselectable(child);

            child = child.nextSibling;
        }
    }

    let getCaretCharacterOffsetWithin = function (element) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;

        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();

            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();

                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        }
        else if ((sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();

            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }

        return caretOffset;
    };

    let blockNestedExceptions = (editor, event, names) => {
        let sender = event.sender;
        let content = sender.editables.content.$;
        let list = sender.editables.list.$;
        let widgets = [];

        names.forEach(function (name) {
            let widget = editor.commands[name];

            widgets.push(widget);
        });

        toggleWidgetState(widgets, content);
        toggleWidgetState(widgets, list);
    };

    let moveCaret = function (node) {
        if (window.getSelection) {
            var selection = window.getSelection();

            if (selection.rangeCount) {
                var range = selection.getRangeAt(0);
                var sibling = node.nextSibling;
                var space = document.createTextNode(' ');

                if (sibling.length !== 0 && /^\s/.test(sibling.nodeValue)) {
                    sibling.nodeValue.trim();

                    // insert space before
                    node.parentNode.insertBefore(space, sibling);
                }
                else {
                    // insert space after
                    node.parentNode.insertBefore(space, node.nextSibling);
                }

                // set caret
                range.setStartAfter(space);
                range.setEndAfter(space);

                // apply changes
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    };

    let blockRenamingLabel = (editor, event) => {
        let content = event.sender.editables.content;

        // moving caret outside of exception bold label
        $(content.$).click(function () {
            let element = this;
            let node = element.childNodes[0];
            let caret = getCaretCharacterOffsetWithin(element.parentNode);

            console.log('click');
            console.log(caret);

            if (caret <= end) {
                moveCaret(node);
            }
        });

        $(content.$).keydown(function (event) {
            let element = this;
            let node = element.childNodes[0];
            let e = event || window.event;
            let key = e.keyCode;
            let arrows = [8, 37, 38, 39, 40, 46];
            let caret = getCaretCharacterOffsetWithin(element.parentNode);

            if (arrows.indexOf(key) != -1) {
                console.log('arror: ' + key);
                console.log('caret: ' + caret);
                console.log('end: ' + end);
                if (caret <= end) {
                    moveCaret(node);
                }
            }
        });
    };

    CKEDITOR.dtd.$editable.span = 1;
    CKEDITOR.plugins.add(
        title, {
            requires: 'widget',
            icons: title,
            init: (editor) => {
                editor.widgets.add(
                    title, {
                        button: 'Add an exception list',

                        template: `<div class="exception">
                            <p>
                                <span class="run_in">
                                    <span class="bold">Exceptions:</span>
                                </span>
                                Add optional paragraph text here
                            </p>
                            <div class="list">
                                <ol class="no_mark">
                                    <li>
                                        <p>
                                            <span class="label">1.</span> Exception list item
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span class="label">2.</span> Exception list item
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        </div>`,

                        editables: {
                            content: {
                                selector: '.exception p'
                            },
                            list: {
                                selector: 'div.list'
                            }
                        },

                        allowedContent: 'div(!exception); span(!run_in); div(!list);',
                        requiredContent: 'div(exception); span(run_in); div(list);',

                        // function fires when processing imported widget's editable area
                        data: (event) => {
                            blockNestedExceptions(editor, event, block);
                            blockRenamingLabel(editor, event, block);
                        },

                        // function fires when initially entering current widget's editable area
                        edit: (event) => {
                            blockNestedExceptions(editor, event);
                            blockRenamingLabel(editor, event);
                        },

                        upcast: (element) => {
                            return element.name === 'div' && element.hasClass('exception') && hasList(element);
                        }
                    }
                )
            },
            afterInit: (editor) => {
                if (!editor) {
                    return;
                }

                console.log('afterInit');

                // configure Caxy Equation -- if available
                if (editor.commands.equation !== undefined) {
                    editor.commands.equation.contextSensitive = true
                    editor.commands.equation.refresh = function (editor) {
                        const startElement = editor.getSelection().getStartElement();
                        const path = new CKEDITOR.dom.elementPath(startElement);
                        const element = path.lastElement && path.lastElement.getAscendant('div', true);

                        if (!(element && (element.hasClass('list') || element.hasClass('exception')))) {
                            this.setState(CKEDITOR.TRISTATE_DISABLED);
                        } else {
                            this.setState(CKEDITOR.TRISTATE_OFF);
                        }

                        editor.commands.equation.refresh();
                    }
                }
            }
        }
    )
})();
