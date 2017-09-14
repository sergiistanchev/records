/**
 * for copyright and usage see plugins/jquery.bgiframe.js
 */
(function($) {
    $.fn.bgIframe = $.fn.bgiframe = function(s) {
        // This is only for IE6
        if (acx.browser.ie6) {
            s = $.extend({
                top     : 'auto', // auto == .currentStyle.borderTopWidth
                left    : 'auto', // auto == .currentStyle.borderLeftWidth
                width   : 'auto', // auto == offsetWidth
                height  : 'auto', // auto == offsetHeight
                opacity : true,
                src     : 'javascript:false;' // jshint ignore:line
            }, s || {});
            var prop = function(n) {
                return n && n.constructor === Number ? n + 'px' : n;
            }, html = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="' + s.src + '"' +
                'style="display:block;position:absolute;z-index:-1;' +
                (s.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '') +
                'top:' + (s.top === 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : prop(s.top)) + ';' +
                'left:' + (s.left === 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : prop(s.left)) + ';' +
                'width:' + (s.width === 'auto' ? 'expression(this.parentNode.offsetWidth+\'px\')' : prop(s.width)) + ';' +
                'height:' + (s.height === 'auto' ? 'expression(this.parentNode.offsetHeight+\'px\')' : prop(s.height)) + ';' +
                '"/>';
            return this.each(function() {
                if ($('> iframe.bgiframe', this).length === 0) {
                    this.insertBefore(document.createElement(html), this.firstChild);
                }
            });
        }
        return this;
    };
})(this.jQuery);

/**
 * icon template
 * creates icons with unlimited recursive overlays
 * eg acx.ut.buttonIcon("print ok");
 */
acx.ut.buttonIcon = function(cls, innerContent) {
    return cls.split(" ").reverse().reduce(function(child, ic) {
        return { tag: "div", cls: "bicon ic-" + ic, child: child };
    }, innerContent);
};

acx.ut.fileImage = function(opt) {
    var fileIconClass = opt.clickable ? "fileIcon " : "fileIcon-disabled ";
    var fileImageObject = {
        tag: "DIV",
        cls: fileIconClass + " ic-" + (opt.fileType ? opt.fileType.toLowerCase() : "nofile"),
        title: opt.tooltip,
        onclick: opt.clickable && acx.isFunction(opt.onclick) ? opt.onclick : null,
        children: [
            { tag: "IMG", cls: 'icon-sprite', src: acx.getResourcePath() + "core/sprites/file-icons.gif" },
            opt.hasMarkups ?
            { tag: "DIV", cls: fileIconClass + " ic-hasmarkups",
                child: { tag: "IMG", cls: "icon-hasmarkups", src: "/html/Images/icons/icon-overlay_edit.gif" }
            }
                :
                null
        ]
    };

    if(opt.fileFrozen){
        fileImageObject.cls = fileIconClass + " ic-frozen";
    }

    return fileImageObject;
};

acx.ut.textLink = function(label, onclick) {
    return { tag:"span", cls: "textlink", text: acx.text(label), onclick: onclick };
};

// utility function for dealing with widget configuration that accept either a text or i18n key
acx.ut.textOrKey = function(text, key) {
    return acx.isEmpty(text, true) ? (acx.text(key) || "") : text;
};

acx.ut.required = function(required) {
    return required ? { tag: "SPAN", cls: "required", text: "*" } : null;
};

acx.ut.loadingMessage = function(msg) {
    return { tag: "DIV", cls: "utLoadingMessage", text: msg || acx.text("Widgets.Generics.Loading") };
};

acx.ut.message = function(message, type, tag) {
    var template = {
        tag: tag || "DIV",
        cls: "message " + (type || "info").toLowerCase(),
        children: [
            {
                tag: "DIV",
                child: {
                    tag: "DIV"
                }
            }
        ]
    };

    var action = (typeof message === "string") ? "html" : "children";
    template.children[0].child[action] = message;

    return template;
};

/**
 * @param opt - Configuration Options. That contains
 *                  - fieldConfigs - field configuration
 *                  - fields - collection of acx.ui.Widget
 */
acx.ut.DocFieldsTableTemplate = function(opt) {
    var _main_template = function() {
        return { tag: "TABLE", cls: "formTable", id: (opt.id || ""), child: { tag: "TBODY", children: _rows_template() } };
    };

    var _row_template = function(field) {
        return { tag: "TR", children: [].concat(field) };
    };

    var _rows_template = function() {
        var cells = opt.fields.items.map(_cells_template);
        var rows = [];
        for (var i = 0; i < cells.length; i++) {
            if (i % 2 === 0) {
                rows.push(_row_template(cells[i]));
            } else {
                rows[rows.length - 1].children = rows[rows.length - 1].children.concat(cells[i]);
            }
        }
        return rows;
    };

    var _cells_template = function(field, i) {
        if (opt.fieldConfigs[i]) {
            return [
                { tag: "TD", cls: "messagecell", child: { tag: "LABEL", text: opt.fieldConfigs[i].label, child: new acx.ut.required(opt.fieldConfigs[i].mandatory) } },
                { tag: "TD", cls: "contentcell", child: field, css: { width: "40%" } }
            ];
        }
    };

    return _main_template();
};

acx.ut.SingleColumnTableTemplate = function(opt) {
    var _main_template = function() {
        return { tag: "TABLE", cls: "formTable", id: (opt.id || ""), child: { tag: "TBODY", children: _rows_template() } };
    };

    var _row_template = function(field) {
        return { tag: "TR", children: [].concat(field) };
    };

    var _rows_template = function() {
        var cells = opt.fields.items.map(_cells_template);
        var rows = [];
        for (var i = 0; i < cells.length; i++) {
            rows.push(_row_template(cells[i]));
        }
        return rows;
    };

    var _cells_template = function(field, i) {
        if (opt.fieldConfigs[i]) {
            return [
                { tag: "TD", cls: "messagecell singleColumnLabelCell", child: { tag: "LABEL", text: opt.fieldConfigs[i].label, child: new acx.ut.required(opt.fieldConfigs[i].mandatory) } },
                { tag: "TD", cls: "contentcell singleColumnFieldCell", child: field }
            ];
        }
    };

    return _main_template();
};

acx.ut.CopyToPanelTableTemplateForProjectsWithCascade = function(opt) {
    var _main_template = function() {
        return { tag: "TABLE", cls: "formTable", id: (opt.id || ""), child: { tag: "TBODY", children: _rows_template().concat([_footer_row_template()]) } };
    };

    var _row_template = function(field) {
        return { tag: "TR", children: [].concat(field) };
    };

    var _rows_template = function() {
        var cells = opt.fields.items.map(_cells_template);
        var rows = [];
        var needle = Math.ceil(parseInt(cells.length, 10) / 2);

        for (var i = 0; i < cells.length; i++) {
            if (i >= needle) {
                rows[parseInt(i - needle, 10)].children = rows[parseInt(i - needle, 10)].children.concat(cells[i]);
            } else {
                rows.push(_row_template(cells[i]));
            }
        }
        return rows;
    };

    var _cells_template = function(field, i) {
        if (opt.fieldConfigs[i]) {
            return [
                { tag: "TD", cls: "messagecell", child: { tag: "LABEL", text: opt.fieldConfigs[i].label, child: new acx.ut.required(opt.fieldConfigs[i].mandatory) } },
                { tag: "TD", cls: "contentcell", child: field, css: { width: "40%" } }
            ];
        }
    };

    var _footer_row_template = function() {
        return { tag: "TR", cls: "formFooter", child: { tag: "TD", colspan: "4", child: { tag: "DIV", cls: "flow-right", children: opt.buttons } }};
    };

    return _main_template();
};

acx.ut.dataTableContainer = function(opt) {
    return { tag: "DIV", cls: "searchResults", children: [
        { tag: "DIV", cls: "toolbar clearFloats", children: [
            { tag: "DIV", cls: "flow-left", children: opt.leftButtons },
            { tag: "DIV", cls: "flow-right", children: opt.rightButtons }
        ]},
        opt.grid
    ]};
};

acx.ut.helpLink = function( baseKey ) {
    return acx.i18n.formatComplex( baseKey + ".HelpText", { tag: "A", target: "_help", href: acx.text( baseKey + ".HelpUrl" ), text: acx.text( baseKey + ".HelpLink" ) } );
};

acx.ut.helpLinkWithTracker = function( baseKey, trackerParams ) {
    return acx.i18n.formatComplex( baseKey + ".HelpText", {
        tag: "A",
        href: acx.text( baseKey + ".HelpUrl" ),
        target: "_blank",
        text: acx.text( baseKey + ".HelpLink" ),
        onclick: function() {
            acx.track.event( { category: trackerParams.category, action: acx.text( baseKey + ".HelpLink" ) + ": clicked", data: trackerParams.label } );
        } } );
};

/**
 * Button widget
 */
acx.ui.Button = acx.ui.Widget.extend({
    _id: "Button",
    defaults : {
//      id: "",                    // the id of the widget
//      baseKey: "",               // baseKey used as a basis for labelKey, tooltipKey, disabledTooltipKey
//      labelKey: "",              // (required*) the i18n key for the text of the button
//      labelText: "",             // alternative to labelKey if you need to add straight text as the label
//      tooltipKey: "",            // the i18n key for the tooltip of the button
//      disabled: false            // create a disabled button
        primary: false,            // gives the button a promoted appearance
        disabledClass: "disabled", // the class added to the button when it is disabled
//      disabledTooltipKey: "",    // the i18n key for the tooltip of the button when disabled
        autoDisable: false,        // automatically disable the button when clicked
        debounce: false,           // prevent rapid reclicking
        debounceTTL: 1200          // number of milliseconds to prevent reclicking
    },

    baseClass: "uiButton",         // base button class

    baseKeyTable: [
        ['labelKey', '.text'],
        ['tooltipKey', '.tooltip'],
        ['disabledTooltipKey', '.disabledTooltip']
    ],

    init: function(parent) {
        this._super();
        if (this.config.baseKey) {
            this._updateBaseKeyTable(this.config.baseKey, true);
        }
        this.label = $.create(this._label_template(this.config));
        this.el = $.create(this.button_template(this.config))
            .bind("click", this.click_handler)
            .bind("mouseenter", function(jEv) {
                $(jEv.currentTarget).addClass("over");
            })
            .bind("mouseleave", function(jEv) {
                $(jEv.currentTarget).removeClass("over");
            });
        if (this.config.disabled) {
            this.disable();
        }
        if (parent) {
            this.el.appendTo(parent);
        }
    },

    click_handler: function(jEv) {
        if (this.disabled || (this.config.debounce && this.debounce(jEv))) {
            return false; // button disabled or debounced, just exit
        }
        if (this.config.autoDisable) {
            this.disable();
        }
        this.fire("click", jEv, this);
    },

    enable: function() {
        this.el.removeClass(this.config.disabledClass);
        this.el.attr("title", acx.text(this.config.tooltipKey) || "");
        this.disabled = false;
        return this;
    },

    disable: function(disable) {
        if (disable === false) {
            return this.enable();
        }
        this.el.addClass(this.config.disabledClass);
        if (this.config.disabledTooltipKey) {
            this.el.attr("title", acx.text(this.config.disabledTooltipKey));
        }
        this.disabled = true;
        return this;
    },

    debounce: function(jEv) {
        if (this.debounceTimer > jEv.timeStamp) {
            return true;
        }
        this.debounceTimer = jEv.timeStamp + this.config.debounceTTL;
        return false;
    },

    _updateBaseKeyTable: function(baseKey, cache) {
        this.config.baseKey = baseKey || this.config.baseKey;
        this.baseKeyTable.forEach(function(lu) {
            this[lu[0]] = (cache ? this[lu[0]] : null) || (acx.text(this.baseKey + lu[1]) && (this.baseKey + lu[1])) || "";
        }, this.config);
    },

    updateBaseKey: function(baseKey) {
        this._updateBaseKeyTable(baseKey, false);
        this.label.text(acx.text(this.config.labelKey));
        this.el.attr("title", acx.text(this.config.tooltipKey));
    },

    button_template: function(config) {
        return (
        { tag: 'BUTTON', type: 'button', id: config.id, title: acx.text(config.tooltipKey), cls: this.baseClass + (this.config.primary ? " primary" : ""), child:
        { tag: 'DIV', cls: 'uiButton-content', child: this.label }
        }
            );
    },

    _label_template: function(config) {
        return { tag: 'DIV', cls: 'uiButton-label', text: acx.ut.textOrKey(config.labelText, config.labelKey) };
    }
});

/**
 * Creates a menu button with an optional menu
 * usage: new acx.ui.MenuButton("#toolbar", {
 *     labelKey: "Page.Button.Name",
 *     menu: new acx.ui.Menu({ items: [ ... ] })
 * });
 */

acx.ui.MenuButton = acx.ui.Button.extend({
    _id: "MenuButton",
    defaults: {
        menu: null // an acx.ui.Menu widget
    },

    baseClass: "uiButton uiMenuButton",

    init: function(parent) {
        this._super(parent);
        this.menu = this.config.menu;
        this.on("click", this.openMenu_handler);
    },

    openMenu_handler: function(jEv) {
        this.menu && this.menu.show($(jEv.target).closest(".uiButton"));
    },

    setMenu: function(newMenu) {
        this.menu = newMenu;
    }
});

acx.ui.BackButton = acx.ui.Button.extend({
    _id: "BackButton",
    defaults: { baseKey: "Widgets.BackButton" },
    baseClass: "uiButton uiBackButton"
});

/**
 * Tabs widget
 */
acx.ui.Tabs = acx.ui.Widget.extend({
    _id: "Tabs",
    defaults: {
//      id:          // the id of the widget
//      defaultTab   // the default tab id to select
//      activeTab    // the id of the initially selected tab, otherwise the default tab is used
        tabItems: [] // the array of initally defined tabs structure is { id: "", ( labelKey: "i18n.key" | labelText: "raw text" ) }
    },

    init: function(parent) {
        this._super();
        this.tabs = {}; // a map of id's to tab elements
        this.el = $.create(this.tabs_template(this.config))
            .bind("click", this.click_handler);
        this.config.tabItems.forEach(function(tab) {
            this.addTab(tab);
        }, this);
        this.setActiveTab(this.config.activeTab);
        if (parent) {
            this.el.appendTo(parent);
        }
    },

    addTab: function(config, before) {
        var el = $.create(this.tabItem_template(config));
        if (config.disabled === true) {
            el.addClass("disabled");
        }
        this.tabs[config.id] = el;
        if (before) {
            this.tabs[before].before(el);
        } else {
            this.el.find("UL").append(el);
        }
        return this;
    },

    removeTab: function(id) {
        if (id in this.tabs) {
            this.tabs[id].remove();
            delete this.tabs[id];
        }
        this.setActiveTab();
        return this;
    },

    setActiveTab: function(id, jEv) {
        id = id || this.config.defaultTab;
        if (id in this.tabs && id !== this.activeTab) {
            this.activeTab = id;
            this.fire("select", id, jEv, this);
        }
        acx.each(this.tabs, function(tid, tel) {
            tel.toggleClass("active", tid === id);
        });
        return this;
    },

    click_handler: function(jEv) {
        var item = $(jEv.target).closest("LI");
        if (item.length && this.activeTab !== item[0].id && !item.hasClass("disabled")) {
            this.setActiveTab(item[0].id, jEv);
        }
    },

    tabs_template: function(config) {
        return (
        { tag: "DIV", id: this.config.id, cls: "uiTabs clearFloats", child:
        { tag: "UL", cls: "uiTabs-list" }
        }
            );
    },

    tabItem_template: function(config) {
        return (
        { tag: "LI", id: config.id, text: config.labelKey ? acx.text(config.labelKey) : config.labelText }
            );
    }
});

acx.ui.Menu = acx.ui.Widget.extend({
    _id: "Menu",
    defaults: {
        //  id: "",                   // the id of the menu
        items: [],                // the array of menu items
        menuProps: null,          // selector to node containing "uimenu-props" data, or null
        parent: "BODY",           // the node that the menu is attached to
        alignLeft: true,          // determines left/right alignment of the menu relative to the target or positionRelativeTo element (change to false to align right)
        disabledClass: "disabled",// the class to use for disabled menu items (change to "none" to have disabled menu items totally hidden)
        selectedClass: "active",
        showSelected: false
    },

    baseClass: "uiMenu",

    init: function(target) {
        this._super();
        this.items = this.config.items;
        this._buildMenu();

        if (this.config.showSelected) {
            this.on("select", this._toggleSelected_handler);
        }

        if (target) {
            $(target).bind("click", this.show_handler);
        }
    },

    hideItem: function(index) {
        this.el.find("LI:nth-child(" + index + ")").hide();
    },

    disableItem: function(index) {
        var title = this.items[index - 1].disabledTooltip ? acx.text(this.items[index - 1].disabledTooltip) : "";
        this.el.find("LI:nth-child(" + index + ")").addClass(this.config.disabledClass).attr("title", title);
    },

    enableItem: function(index) {
        this.el.find("LI:nth-child(" + index + ")").removeClass(this.config.disabledClass).attr("title", "");
    },

    selectItem: function(id) {
        this._selectItem(this.el.find("#" + id).closest("LI"));
    },

    _selectItem: function(item) {
        this.el.find("LI").removeClass(this.config.selectedClass);
        item.addClass(this.config.selectedClass);
    },

    _toggleSelected_handler: function(jEv) {
        this._selectItem(jEv.item);
    },

    // usage: ... onclick: function(jEv) { menu.show(this, mprops); } ...
    show: function(target, mprops, jEv) {
        target = $(target);
        this.hide_handler();
        this.mprops = this.config.menuProps ? target.closest(this.config.menuProps).data("uimenu-props") : mprops;
        this.el.css(this._getLocation(target, jEv))
            .css("display", "block");
        for (var p = target.parents(), i = 0; i < p.length; i++) {
            var z = parseInt($(p[i]).css("zIndex"), 10);
            if (z) {
                this.el.css("zIndex", z);
                break;
            }
        }
        this.fire("open", target, this);
        var cx = this;
        setTimeout(function() {
            $(document).bind("click", cx.hide_handler);
        }, 50);
    },

    show_handler: function(jEv, mprops) {
        this.show(jEv.target, mprops);
    },

    hide_handler: function(jEv) {
        $(document).unbind("click", this.hide_handler);
        this.el.css("display", "none");
    },

    menu_template: function(items) {
        return { tag: "UL", cls: this.baseClass, css: { position: "absolute" }, children: items.map(this.menuItem_template, this) };
    },

    menuItem_template: function(item) {
        if (!item) {
            return;
        }
        var ret = { tag: "LI", cls: "uiMenu-item", children: [
            { tag: "DIV", cls: "uiMenu-label" }
        ] };
        acx.each(item, function(attr) {
            switch (attr) {
                case "disabled" :
                    ret.cls += " " + this.config.disabledClass;
                    ret.title = item.disabledTooltip ? acx.text(item.disabledTooltip) : null;
                    break;
                case "disabledTooltip" :
                    break;
                case "label" :
                    ret.children[0].text = acx.text(item.label);
                    break;
                case "labelText" :
                    ret.children[0].text = item.labelText;
                    break;
                case "selected" :
                    if (this.config.showSelected && item[attr]) {
                        ret.cls += " " + this.config.selectedClass;
                    }
                    break;
                case "items" :
                    ret.children[0].cls += " uiMenu-subMenu";
                    ret.children.push(this.menu_template(item.items));
                    break;
                case "onclick" :
                    ret.onclick = function(jEv) {
                        var jItem = $(jEv.target).closest("LI");
                        if (! jItem.hasClass(this.config.disabledClass)) {
                            this.fire("select", { mprops: this.mprops, item: jItem }, jEv, this);
                            item.onclick.call(this, this.mprops, jEv, item, this);
                        }
                    }.bind(this);
                    break;
                default :
                    // adding custom attributes to both the LI and the DIV as a workaround to the blurred responsibilities
                    // between the two. Eg. the select event finds and returns the LI, but the DIV gets the id from the config.
                    ret[attr] = item[attr];
                    ret.children[0][attr] = item[attr];
            }
        }.bind(this));
        return ret;
    },

    _buildMenu: function() {
        // most of this fiddling around in here is to work the peekaboo select bug in ie6
        // this should be refactored when ie6 support is no longer required
        this.el = $.create(this.menu_template(this.items))
            .attr("id", this.config.id)
            .appendTo(this.config.parent)
            .css({ visibility: "hidden", display: "block" });
        this._fixMenu(this.el, 0);
        if (acx.browser.ie6) {
            this.el.find("UL").andSelf().bgiframe({ opacity: true });
        }
        this.el.css({ visibility: "", display: "none" });
    },

    // recursive function that applies mouse handlers and browser fixes
    _fixMenu: function(menu, parentWidth) {
        if (! menu.length) {
            return;
        }
        var mi = menu.children("LI"), maxWidth = Math.max.apply(null, $.map(mi, function(el) {
            return el.clientWidth;
        }));
        menu.css('marginLeft', parentWidth);
        acx.each(mi, function(i) {
            var item = $(mi[i])
                .bind("mouseenter", function(jEv) {
                    $(jEv.currentTarget).addClass("over");
                })
                .bind("mouseleave", function(jEv) {
                    $(jEv.currentTarget).removeClass("over");
                })
                .css({ zoom: 1, width: maxWidth });
            this._fixMenu(item.children("UL"), maxWidth - 5);
        }.bind(this));
    },

    _getLocation: function(target) {
        var alignRightXOffset = !this.config.alignLeft ? target.outerWidth() - this.el.width() : 0;
        return acx.vector(target.offset()).addY(target.outerHeight()).addX(alignRightXOffset).asOffset();
    }
});


/**
 * base class for all modal panels (eg dialogpanel, infopanel),
 * this is an abstract class
 * provides open, close, modal and panel stacking
 */
acx.ui.AbstractPanel = acx.ui.Widget.extend({
    _id: "Panel",
    defaults: {
        body: null,            // initial content of the body
        modal: true,           // create a modal panel - creates a div that blocks interaction with page
        height: 'auto',        // panel height
        maxHeight: null,       // maximum panel height
        width: 400,            // panel width (in pixels)
        open: false,           // show the panel when it is created
        parent: 'BODY',        // node that panel is attached to
        autoRemove: false,     // remove the panel from the dom and destroy the widget when ok / cancel / close buttons clicked
        zIndex: 150,
        animateCloseToElement: null // To which element we are animating the panel to get sucked away
    },

    shared: {  // shared data for all instances of acx.ui.Panel and decendants
        stack: [], // array of all open panels
        modal: $.create({ tag: "DIV", id: "uiModal", css: { opacity: 0.6, position: "absolute", top: "0px", left: "0px" } })
    },

    init: function() {
        this._super();
    },

    // open the panel
    open: function(jEv) {
        this.el
            .css({ visibility: "hidden" })
            .appendTo($(this.config.parent))
            .css(this._getPosition(jEv))
            .css({ zIndex: (this.shared.stack.length && !this.config.zIndex ? (+this.shared.stack[this.shared.stack.length - 1].el.css("zIndex") + 10) : this.config.zIndex) })
            .bgiframe({ opacity: true })
            .css({ visibility: "visible", display: "block", position: "absolute" });
        var index = this.shared.stack.indexOf(this);
        if (index !== -1) {
            this.shared.stack.splice(index, 1);
        }
        this.shared.stack.push(this);
        this._setModal();
        this.fire("open", { source: this, event: jEv });
        return this;
    },

    // closes the panel
    close: function(jEv) {
        var index = this.shared.stack.indexOf(this);
        if (index !== -1) {
            this.shared.stack.splice(index, 1);
            if(this.config.animateCloseToElement && this.config.animateCloseToElement.length) {
                this._animateClose(jEv);
            }
            else {
                this.fire("close", { source: this,  event: jEv });
                this.el.css({ left: "-2999px" }); // move the dialog to the left rather than hiding to prevent ie6 rendering artifacts
            }
            this.el.children("IFRAME.bgiframe").remove(); // remove the iframe for performance reasons
            this._setModal();
            if (this.config.autoRemove) {
                this.remove();
            }
        }
        return this;
    },
    _animateClose: function(jEv) {
        var element = this.config.animateCloseToElement,
            offset = element.offset(),
            panel = this;

        this.el.animate({
            top: offset.top,
            left: offset.left,
            width: element.width(),
            height: element.height(),
            opacity: 0
        }, {
            duration: 400,
            complete: function() {
                panel.fire("close", { source: this,  event: jEv });
                panel.el.removeAttr('style').remove();
            }
        });
    },

    // close the panel and remove it from the dom, destroying it (you can not reuse the panel after calling remove)
    remove: function() {
        this.close();
        this.fire("remove", { source: this });
        this.el.remove();
    },

    // starting at the top of the stack, find the first panel that wants a modal and put it just underneath, otherwise remove the modal
    _setModal: function() {
        function docSize() {
            var de = document.documentElement;
            return acx.browser.msie ? // jquery incorrectly uses offsetHeight/Width for the doc size in IE
                acx.vector(Math.max(de.clientWidth, de.scrollWidth), Math.max(de.clientHeight, de.scrollHeight)) : $(document).vSize();
        }

        for (var stackPtr = this.shared.stack.length - 1; stackPtr >= 0; stackPtr--) {
            if (this.shared.stack[stackPtr].config.modal) {
                // work around a problem in ie8 / jquery where offsetWidth/Height is too large when there are no scrollbars
                this.shared.modal
                    .appendTo(document.body)
                    .css({ zIndex: this.shared.stack[stackPtr].el.css("zIndex") - 5 })
                    .css(docSize().asSize());
                return;
            }
        }
        this.shared.modal.remove(); // no panels that want a modal were found
    },

    _getPosition: function() {
        return acx.vector(document.documentElement.clientWidth, document.documentElement.clientHeight)// get the current viewport size
            .sub(this.el.vSize())// subtract the size of the panel
            .mod(function(s) {
                return s / 2;
            })// divide by 2 (to center it)
            .add($(document).vScroll())// add the current scroll offset
            .mod(function(s) {
                return Math.max(5, s);
            })// make sure the panel is not off the edge of the window
            .asOffset();                                  // and return it as a {top, left} object
    },

    refreshPosition: function() {
        this.el.css(this._getPosition());
    }
});

/**
 * A sub class of acx.ui.Panel that adds a title bar, button bar. close box and drag functionality
 */
acx.ui.DraggablePanel = acx.ui.AbstractPanel.extend({
    _id: "DraggablePanel",

    defaults: {
        //     titleText: null,   // raw text for the panel title
        //     titleKey: null,    // i18n key for the panel title
        buttonBar: null,   // secondary buttons (or other content) in the left button bar
        autoClose: true,   // close the panel when ok / cancel / close buttons clicked
        baseClass: null,    // adds a base class to the panel dom element
        addLoadingBlocker: false  // enable loading blocker for the dialog
    },

    init: function() {
        this._super();

        this.autoClose = this.config.autoClose;

        // create addressable elements within the dialog
        this.body = $.create(this._body_template());
        this.title = $.create(this._title_template());
        this.buttonBar = $.create(this._leftButtonBar_template());

        // create the panel
        this.el = $.create(this._panel_template());
        this.el.css({ width: this.config.width });
        if (acx.browser.ie6) { // if ie6 force the body width so that the horizontal scrollbar works
            this.el.find(".uiPanel-body").width(this.config.width - 4);
        }

        // add drag capability to the title
        this.dd = new acx.ux.DragDrop({
            pickupSelector: this.el.find(".uiPanel-titleBar"),
            dragObj: this.el
        });

        if(this.config.addLoadingBlocker) {
            this._initLoadingBlocker();
            this.el.append(this.loadingBlocker.el);
        }

        // open the panel if set in configuration
        if (this.config.open) {
            this.open();
        }
    },

    preventClose: function(prevent) {
        this.autoClose = (prevent === false);
    },

    open: function(jEv) {
        this._super(jEv);
        this.showLoading();
    },

    _initLoadingBlocker: function() {
        this.loadingBlocker = new acx.ui.DialogLoadingBlocker({
            dialog: this
        });
    },
    showLoading: function() {
        if(this.loadingBlocker) {
            this.loadingBlocker.show();
            this.el.addClass('panelloading');
        }
    },
    hideLoading: function() {
        if(this.loadingBlocker) {
            this.loadingBlocker.hide();
            this.el.removeClass('panelloading');
        }
    },
    refreshLoading: function() {
        this.loadingBlocker && this.loadingBlocker.refresh();
    },

    _body_template: function() {
        return (
        { tag: "DIV", cls: "uiPanel-body", css: {
            maxHeight: (acx.isNumeric(this.config.maxHeight) ? this.config.maxHeight - 80 : null),
            height: this.config.height + (this.config.height === 'auto' ? "" : "px" )
        }, children: this.config.body }
            );
    },

    _title_template: function() {
        return (
        { tag: "SPAN", cls: "uiPanel-title", text: acx.ut.textOrKey(this.config.titleText, this.config.titleKey) }
            );
    },

    _rightButtonBar_template: function() {
        return (
        { tag: "DIV", cls: "flow-right" }
            );
    },

    _leftButtonBar_template: function() {
        return (
        { tag: "DIV", cls: "flow-left", child: this.config.buttonBar }
            );
    },

    _panel_template: function() {
        return (
        { tag: "DIV", id: this.id(), cls: "uiPanel " + (this.config.baseClass ? this.config.baseClass : ""), children: [
            { tag: "DIV", cls: "uiPanel-titleBar", children: [
                { tag: "DIV", cls: "uiPanel-closeBox", onclick: this.cancel_handler },
                this.title
            ]},
            this.body,
            { tag: "DIV", cls: "uiPanel-buttonBar clearFloats", children: [
                this._rightButtonBar_template(),
                this.buttonBar
            ] }
        ] }
            );
    },

    cancel_handler: function(jEv) {
        this.fire("cancel", { source: this, event: jEv });
        if (this.autoClose) {
            this.close(jEv);
        }
        this.autoClose = this.config.autoClose;
    },

    setContent: function(el) {
        this.body.empty().append(el);
        return this;
    },

    setTitle: function(title) {
        this.title.text(title);
    }
});

acx.ui.InfoPanel = acx.ui.DraggablePanel.extend({
    _id: "InfoPanel",

    _rightButtonBar_template: function() {
        return (
        { tag: "SPAN", cls: "flow-right", child:
            (new acx.ui.Button({ id: this.id("cancel"), baseKey: "Widgets.Generics.Close", onClick: this.cancel_handler })).el
        }
            );
    }
});

acx.ui.DialogPanel = acx.ui.DraggablePanel.extend({
    _id: "DialogPanel",

    defaults: {
        showCommitButton: true,
        commitBtnConfig: {},      // additional config options for the commit button (see acx.ui.Button)
        cancelBtnConfig: {}       // additional config options for the cancel button (see acx.ui.Button)
    },

    init: function() {
        this.commitButton = new acx.ui.Button(acx.extend({}, { baseKey: "Widgets.Generics.Ok" }, this.config.commitBtnConfig, { id: this.id("commit") }));
        this.cancelButton = new acx.ui.Button(acx.extend({}, { baseKey: "Widgets.Generics.Cancel" }, this.config.cancelBtnConfig, { id: this.id("cancel") }));

        this._super();

        this.commitButton.on("click", this.commit_handler);
        this.cancelButton.on("click", this.cancel_handler);
    },

    commit_handler: function(jEv) {
        this.fire("commit", { source: this, event: jEv });
        if (this.autoClose) {
            this.close(jEv);
        }
        this.autoClose = this.config.autoClose;
    },

    _rightButtonBar_template: function() {
        return ({
            tag: "SPAN", cls: "flow-right", children: [
                (this.config.showCommitButton ? this.commitButton.el : null),
                this.cancelButton.el
            ]
        });
    }
});

acx.ui.UnsavedChangesPanel = acx.ui.DraggablePanel.extend({
    _id: "UnsavedChangesPanel",

    defaults: {
        titleKey: 'Widgets.UnsavedChangesPanel.Title',
        body: acx.ut.message(acx.text('Widgets.UnsavedChangesPanel.Message'))
    },

    init: function() {
        this.saveButton = new acx.ui.Button({
            id: this.id("save"),
            baseKey: "Widgets.UnsavedChangesPanel.Save",
            primary: true
        });

        this.ignoreButton = new acx.ui.Button({
            id: this.id("ignore"),
            baseKey: "Widgets.UnsavedChangesPanel.Ignore"
        });

        this._super();

        this.saveButton.on('click', this.save_handler);
        this.ignoreButton.on('click', this.ignore_handler);
    },

    save_handler: function() {
        this.fire('save');

        if (this.config.autoClose) {
            this.close();
        }
    },

    ignore_handler: function() {
        this.fire('ignore');

        if (this.config.autoClose) {
            this.close();
        }
    },

    _rightButtonBar_template: function() {
        return { tag: "SPAN", cls: "flow-right", children: [
            this.saveButton.el,
            this.ignoreButton.el
        ]};
    }
});

/**
 *  Alert Panel
 **/
acx.alert = function(message, level) {
    level = level || "check";
    this.alertPanel = this.alertPanel || new acx.ui.InfoPanel({
        id: "alertPanel",
        baseClass: "alertPanel",
        titleKey: "Widgets.Generics.Alert",
        width: 450
    });
    this.alertPanel.setContent($.create(acx.ut.message(message, level))).open();
};

/**
 *  Confirmation Panel
 **/
acx.ui.ConfirmPanel = acx.ui.DialogPanel.extend({
    _id: "ConfirmPanel",
    defaults: {
        commitBtnConfig: {
            primary: true
        },
        commitButtonBaseKey: undefined,
        titleKey: "Widgets.Generics.Confirm",
        baseClass: "confirmPanel",
        width: 450,
        open: true,
        message: undefined
    },

    init: function() {
        this.config.commitBtnConfig = acx.extend(this.config.commitBtnConfig, { baseKey: this.config.commitButtonBaseKey });
        this.config.body = $.create(acx.ut.message(this.config.message, "check"));
        this._super();
    }
});

acx.ui.AttachLocalFilePanel = acx.ui.DialogPanel.extend({
    defaults: {
        id: "attachLocalFile",
        controller: "/Attachment",
        action: "attachLocalFiles",
        titleKey: "Widgets.AttachLocalFilePanel.AttachLocalFile",
        viewName: "attach/AttachedLocalFiles.inc",
        width: (acx.browser.ie67 ? 470 : null),
        data: "writeToPermanentFileStore=true&attachToSession=false",   // the request parameters that sending to the server when uploading files
        attachFileCallBack: function() {
        },                              // call back function after attaching files
        commitBtnConfig: { labelKey: "Widgets.Generics.Attach", tooltipKey: "Widgets.Generics.Attach", primary: true }
    },

    init: function() {
        this.attachAnotherLink = $.create(this._attachAnotherFileLinkRow_template());
        this.messageBar = new acx.ui.MessageBar({
            id: "attachLocalItemMessageBar"
        });
        this._super();

        this.attachAnotherLink.on("click", this._addRow_handler);
        this.form = $("FORM", this.body).get(0);
        this.noOfRows = 0;
        this._reset();

        this.fileUploader = new acx.ui.FileUploader(this.el, {
            id: "localFiles",
            showProgressPanel: true,
            callback: this.config.attachFileCallBack,
            onUploadStarted: function() {
                this.close();
            }.bind(this)
        });
    },

    /* START - template methods */
    _attachAnotherFileLinkRow_template: function() {
        return { tag: "DIV", id:"attachAnotherFileLink", css: { padding: "2px 15px" }, cls: "textlink",
            text: acx.text("Widgets.AttachLocalFilePanel.AttachAnotherFile")
        };
    },

    _attachLocalFileRow_template: function(fileFieldName) {
        return { tag: "DIV", cls: "attachLocalFileRow", children: [
            { tag: "INPUT", type: "file", name: fileFieldName, size: 60 },
            { tag: "DIV", cls: "trash", onclick: this._removeRow_handler,
                style: this.noOfRows === 1 ? "display: none;" : "" }
        ]};
    },

    _attachLocalFile_template: function() {
        return { tag: "FORM", method: "POST",
            action: this.config.controller +
                "?_action=" + this.config.action +
                "&viewName=" + this.config.viewName +
                (acx.isEmpty(this.config.data) ? "" : "&" + this.config.data),
            children: [
                { tag: "DIV", css: { padding: "4px" } },
                this.attachAnotherLink
            ]
        };
    },

    _body_template: function() {
        return [
            this.messageBar.el,
            { tag: "DIV", cls: "uiAttachLocalFilePanel uiPanel-body",
                css: { padding: 0, height: this.config.height + (this.config.height === 'auto' ? "" : "px" ) },
                child: this._attachLocalFile_template()
            }];
    },
    /* END - template methods */

    /* START - handler methods */
    _addRow_handler: function() {
        this._addRow();
    },

    _removeRow_handler: function(jEv) {
        this._removeRow(jEv.target);
    },

    commit_handler: function(jEv) {
        var validFiles = 0, files = [];

        $("INPUT[type=file]", this.body).map(function(index, el) {
            if (el.value.trim().length > 0) {
                validFiles++;
                files.push(el);
            }
        });

        this.messageBar.empty();
        if (validFiles > 0) {
            this.fileUploader.upload(files);
        } else {
            this.messageBar.add("check", acx.text("Widgets.AttachLocalFilePanel.PleaseSelectOneFile"));
            return;
        }
        this._super(jEv);
        this._reset();
    },

    cancel_handler: function(jEv) {
        this._super(jEv);
        this._reset();
    },

    /* END - handler methods */

    /* START - private methods */
    _addRow: function() {
        var fileFieldName = "FILE_PATH_NAME";
        if (this.noOfRows > 0) {
            fileFieldName += "_" + this.noOfRows.toString().zeroPad(6);
        }
        this.noOfRows++;
        var newRow = $.create(this._attachLocalFileRow_template(fileFieldName));
        newRow.hide();
        this.attachAnotherLink.before(newRow);
        newRow.slideDown('fast');
        this._refresh();
    },

    _removeRow: function(el) {
        this.noOfRows--;
        var row = $(el).closest(".attachLocalFileRow");
        row.slideUp('fast', function() {
            row.remove();
        });
        this._refresh();
    },

    _refresh: function() {
        this._refreshTrashIcons();
    },

    _refreshTrashIcons: function() {
        var icons = $(".trash", this.el);
        icons[this.noOfRows === 1 ? "hide" : "show"]();
    },

    _reset: function() {
        this.noOfRows = 0;
        this.messageBar.empty();
        $("DIV.attachLocalFileRow", this.body).remove();
        this._addRow();
    }
    /* END - private methods */
});

acx.ui.ProgressBar = acx.ui.Widget.extend({
    _id: "ProgressBar",
    defaults: {
        percentage: 0  //number between 0 and 100 to initialize the progress bar at.
    },

    init: function(parent) {
        this._super();

        this.progressBar = $.create(this._progressBar_template());
        this.statusLabel = $.create(this._statusLabel_template());
        this.el = $.create(this._main_template());

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    update: function(percent) {
        if (parseInt(percent, 10) >= 0 && parseInt(percent, 10) <= 100) {
            this.progressBar.width(percent + "%");
            this.statusLabel.text(percent + "%");
        }
    },

    centreStatusLabel: function() {
        this.statusLabel.css("marginLeft", (this.el.width() / 2) - (this.statusLabel.width() / 2) + "px");
    },

    setStatusLabel: function(label) {
        this.statusLabel.text(label);
        this.centreStatusLabel();
    },

    _statusLabel_template: function() {
        return { tag: "DIV", cls: "status", text: this.config.percentage + "%" };
    },

    _progressBar_template: function() {
        return { tag: "DIV", cls: "progress", css: { width: this.config.percentage + "%" } };
    },

    _main_template: function() {
        return { tag: "DIV", cls: "uiProgressBar", children: [ this.statusLabel, this.progressBar ] };
    }
});

acx.ui.UploadProgressPanel = acx.ui.DialogPanel.extend({
    _id: "UploadProgressPanel",
    defaults: {
        showCommitButton: false,
        width: 650,
        titleKey: "Widgets.UploadProgressPanel.Title",
        showTimeRemaining: false
    },

    init: function() {
        this._super();

        this.uploadProgress = new acx.ui.UploadProgress({
            showTimeRemaining: this.config.showTimeRemaining,
            isFormTable: true
        });

        this.setContent(this.uploadProgress.el);
    },

    open: function() {
        this._super();
        this.uploadProgress.centreProgressBarStatusLabel();
    },

    setFileNames: function(fileNames) {
        this.uploadProgress.setFileNames(fileNames);
    },

    updateProgressBar: function(percent) {
        this.uploadProgress.update(percent);
    },

    setProgressBarStatusLabel: function(text) {
        this.uploadProgress.setProgressBarStatusLabel(text);
    },

    update: function(data) {
        this.uploadProgress.update({
            sentBytes: data.sentBytes,
            totalBytes: data.totalBytes
        });

        if (parseInt(data.sentBytes, 10) === parseInt(data.totalBytes, 10)) {
            this.fire("progressFinished", this);
        }
    },

    reset: function() {
        this.uploadProgress.reset();
    }
});

acx.ui.FileUploader = acx.ui.Widget.extend({
    _id: "FileUploader",
    defaults: {
        callback: null,
        updateStatusDelay: 200,
        showProgressPanel: false
    },

    init: function(parent) {
        this._super();
        this.parent = parent;
        this._initElements();
        this._initEvents();
    },

    _initElements: function() {
        if (this.config.showProgressPanel) {
            this.uploadProgressPanel = new acx.ui.UploadProgressPanel({ id: this.id("uploadProgressPanel") });
        }
    },

    _initEvents: function() {
        this.on("__done__", this._retrieveUploadedFiles_handler);
        if (this.config.showProgressPanel) {
            this.uploadProgressPanel.on("cancel", this._uploadCancelled_handler);
            this.on("__done__", this._changeProgressPanelStatus_handler);
            this.on("uploadComplete", this._hideProgressPanel_handler);
            this.on("uploadCancelled", this._hideProgressPanel_handler);
            this.on("uploadStarted", this._showProgressPanel_handler);
            this.on("statusUpdate", this._updateProgressPanel_handler);
        }
    },

    upload: function(files) {
        this._resetForUpload();
        files.forEach(this._prepareFiles_handler);

        this.fire("uploadStarted", this);

        this.form.append(files);
        this.isFormSubmitCompleteInterval = setInterval(this._isFormSubmitComplete_handler, this.config.updateStatusDelay);
        this._submitForm();
        $(window).on('beforeunload', function () {
            acx.loader.hide();
            return acx.text("FileUploader.CanNotCancel");
        });
    },

    _submitForm: function() {
        var nextFileUploadId = this._generateFileUploadId();
        this.form.attr("action", this.form.attr("action") + nextFileUploadId);
        this.form.submit();
        this._checkUploadStatus(nextFileUploadId);
    },

    _resetForUpload: function() {
        this.fileCount = 0;
        this.filesObj = {};
        this.fileNames = [];
        this._resetIframe();
        this._resetForm();
        if (this.parent) {
            this.parent.append(this.el).append(this.form);
        }
        if (this.config.showProgressPanel) {
            this.uploadProgressPanel.reset();
        }
    },

    _resetIframe: function() {
        if (this.el) {
            this.el.remove();
        }
        this.el = $(this._main_template());
    },

    _resetForm: function() {
        if (this.form) {
            this.form.remove();
        }
        this.form = $.create(this._form_template());
    },

    _prepareFiles_handler: function(el) {
        var id = this._generateFileUploadId(), jEl = $(el);
        var name = "_preUploaded_" + jEl.attr("name");

        this.filesObj[name] = id;
        jEl.attr("name", id);

        var filePath = jEl.val();
        var slash = Math.max(filePath.lastIndexOf('\\'), filePath.lastIndexOf('/'));
        this.fileNames.push(filePath.substring(slash !== -1 ? slash + 1 : 0, filePath.length));
    },

    _generateFileUploadId: function () {
        return acx.getCookie("JSESSIONID") + '-' + Math.round(Math.random() * 2147483647) + '-' + this.fileCount++;
    },

    _checkUploadStatus: function(id) {
        this.statusInterval = setInterval(function() {
            if (!this.statusInProgress) {
                this.statusXhr = acx.ajax({
                    url : '/upload/Status',
                    data : 'uploadId=' + id,
                    onStart: function() {
                        this.statusInProgress = true;
                    }.bind(this),
                    onSuccess : this._updateProgress_handler
                });
            }
        }.bind(this), this.config.updateStatusDelay);
    },

    _stopStatusCheck: function() {
        clearInterval(this.statusInterval);
        this.statusInProgress = false;
    },

    _updateProgress_handler: function(response) {
        var values = response.split('|');
        this.fire("statusUpdate", { sentBytes: values[0], totalBytes: values[1] });
        if (parseInt(values[0], 10) === parseInt(values[1], 10)) {
            clearInterval(this.statusInterval);
        }
        this.statusInProgress = false;
    },

    _updateProgressPanel_handler: function(data) {
        this.uploadProgressPanel.update(data);
    },

    _isFormSubmitComplete_handler: function() {
        var status = this.el.contents().find("BODY").text();
        if (!acx.isEmpty(status)) {
            clearInterval(this.isFormSubmitCompleteInterval);
            this.fire(status);
        }
    },

    _uploadCancelled_handler: function() {
        this.fire("uploadCancelled", this);
        clearInterval(this.isFormSubmitCompleteInterval);
        this.el.contents().get(0).location.href = "about:blank";
        if (this.statusInProgress && this.statusXhr) {
            try {
                this.statusXhr.abort();
            } catch(e) {
            }
        }
        this._stopStatusCheck();
        $(window).off('beforeunload');
    },

    _changeProgressPanelStatus_handler: function() {
        this.uploadProgressPanel.updateProgressBar(100);
        this.uploadProgressPanel.setProgressBarStatusLabel(acx.text("Widgets.FileUploader.AttachingYourFiles") + "...");
        this.uploadProgressPanel.cancelButton.disable();
    },

    _retrieveUploadedFiles_handler: function() {
        this._stopStatusCheck();
        acx.ajax({
            url: "/Attachment?writeToPermanentFileStore=true&attachToSession=false",
            _action: "attachLocalFiles",
            viewName: "attach/AttachedLocalFiles.inc",
            data: $.param(this.filesObj),
            onSuccess: this._uploadComplete_handler
        });
    },

    _uploadComplete_handler: function(response) {
        this.fire("uploadComplete", this);
        if (acx.isFunction(this.config.callback)) {
            this.config.callback(response);
        }
        $(window).off('beforeunload');
    },

    _hideProgressPanel_handler: function() {
        this.uploadProgressPanel.close();
        this.uploadProgressPanel.cancelButton.enable();
    },

    _showProgressPanel_handler: function() {
        this.uploadProgressPanel.setFileNames(this.fileNames);
        this.uploadProgressPanel.open();
    },

    _form_template: function() {
        return { tag: "FORM",
            encoding: "multipart/form-data",
            enctype: "multipart/form-data",
            action: "/upload/File?uploadId=",
            method: "POST",
            target: this.id(),
            css: { display: "none" }
        };
    },

    _main_template: function() {
        // Not using template because IE7 doesnt allow changing name attribute after iframe creation
        return "<iframe id='" + this.id() + "' name='" + this.id() + "' style='display: none;'></iframe>";
    }
});

acx.ui.AttachItemPanel = acx.ui.DialogPanel.extend({
    _id: "AttachItemPanel",
    FADE_SPEED:"slow",

    defaults: {
        commitBtnConfig: {
            primary : true,
            labelKey: "Widgets.Generics.Attach",
            tooltipKey: "Widgets.Generics.Attach",
            disabledKey: "Widgets.Generics.DisabledTooltip"
        },
        height: 400,
        width: 900,
        minSelected: 1,
        maxSelected: null,
        numSelected: function() {
            return  0;
        },
        autoClose: false,
        limit: null,
        lessThanMinKey: "Widgets.AttachItemPanel.PleaseAttachMoreThan",
        moreThanMaxKey: "Widgets.AttachItemPanel.PleaseAttachLessThan"
    },

    init: function(parent) {
        this.minSelected = parseInt(this.config.minSelected, 10);
        this.maxSelected = !acx.isEmpty(this.maxSelected) ? parseInt(this.config.maxSelected, 10) : null;

        this.iframe = $.create(this._iframe_template());
        this.loader = new acx.ui.LoadingBlocker({ waitingFrame: this.iframe });
        this._resetBody_handler();

        this._super(parent);

        this._initEvents();
    },

    _initEvents: function() {
        this.loader.on("loaderHidden", this._showIframe_handler);
        this.on("close", this._resetBody_handler);
        this.on("open", this._setIframeSrc_handler);
    },

    _setIframeSrc_handler: function() {
        this.iframe.attr("src", this._buildSearchAction());
    },

    _buildSearchAction: function() {
        // Override this method in the child class
    },

    _resetBody_handler: function() {
        this._showLoader();
        this.iframe.attr("src", null);
    },

    _showLoader: function() {
        this.iframe.hide();
        this.loader.show();
    },

    _showIframe_handler: function() {
        this.iframe.fadeIn(this.FADE_SPEED);
    },

    commit_handler: function() {
        if (this._validate()) {
            this._super();
            this._showLoader();
            this.fire("selection", this, this._getSelectionDetails());
        }
    },

    cancel_handler: function() {
        this._super();
        this.close();
    },

    _validate: function() {
        if (!acx.isEmpty(this.maxSelected) && this.maxSelected < this.minSelected) {
            return false;
        }
        var selected = this._getNumSelected();

        return this._isMoreThanMin(this.minSelected, selected) && this._isLessThanMax(this.maxSelected, selected);
    },

    _isMoreThanMin: function(min, selected) {
        var isOk = (min <= selected);
        if (!isOk) {
            acx.alert(acx.text(this.config.lessThanMinKey, min));
        }
        return isOk;
    },

    _isLessThanMax: function(max, selected) {
        var isOk = (!max || max >= selected);
        if (!isOk) {
            acx.alert(acx.text(this.config.moreThanMaxKey, max, this.config.limit));
        }
        return isOk;
    },

    _getNumSelected: function() {
        return acx.isFunction(this.config.numSelected) ? parseInt(this.config.numSelected(), 10) : 0;
    },

    _getSelectionDetails: function() {
        return this.iframe[0].contentWindow.getSelectionDetails();
    },

    _iframe_template: function() {
        var height = acx.isNumeric(this.config.height) ? (this.config.height - 3) + "px" : this.config.height;
        return { tag: 'IFRAME', id: this.id("iframe"), frameBorder:'0', css: { height: height, width: this.config.width } };
    },

    _body_template: function() {
        return acx.extend(
            this._super(),
            { children: [ this.iframe, this.loader ] }
        );
    }
});

acx.ui.AttachDocPanel = acx.ui.AttachItemPanel.extend({
    _id: "AttachDocPanel",
    defaults: {
        titleKey: "Widgets.AttachDocPanel.AttachDocumentFromRegister",
        searchAction: "19",
        attachMode: "MAIL",
        allowRegDocs: true,
        allowUnregDocs: true
    },

    init: function(parent) {
        this.config.numSelected = function() {
            return this._getNumberSelectedDocuments();
        }.bind(this);
        this._super(parent);
        this.maxSelected = this.config.maxSelected;
        this.allowUnregDocs = this.config.allowUnregDocs;
    },

    _getNumberSelectedDocuments: function() {
        return this.iframe[0].contentWindow.getNumSelected();
    },

    _buildSearchAction: function() {
        return "/SearchControlledDoc" +
            "?displayMode=popup" +
            "&SEARCH_ACTION=" + this.config.searchAction +
            "&attachMode=" + this.config.attachMode +
            "&allowRegDocs=" + this.config.allowRegDocs +
            "&allowUnregDocs=" + this.allowUnregDocs +
            "&maxSelected=" + this.maxSelected;
    }
});

acx.ui.AttachMailPanel = acx.ui.AttachItemPanel.extend({
    _id: "AttachMailPanel",
    defaults: {
        titleKey: "Widgets.AttachMailPanel.AttachProjectMail",
        lessThanMinKey: "Widgets.AttachMailPanel.PleaseAttachMoreThan",
        attachMode: "MAIL",
        allowInbox: true,
        allowSent: true,
        allowDraft: false
    },

    init: function(parent) {
        this.config.numSelected = function() {
            return this._getNumberSelectedMails();
        }.bind(this);
        this._super(parent);
    },

    _getNumberSelectedMails: function() {
        return this.iframe[0].contentWindow.getNumSelected();
    },

    _buildSearchAction: function() {
        return "/CorrespondenceSearch" +
            "?displayMode=popup" +
            "&actionID=displaySearchFormPopup" +
            "&attachMode=" + this.config.attachMode +
            "&allowInbox=" + this.config.allowInbox +
            "&allowSent=" + this.config.allowSent +
            "&allowDraft=" + this.config.allowDraft;
    }
});

acx.ui.FullScreenPanel = acx.ui.DialogPanel.extend({
    _id: "FullScreenPanel",
    FADE_SPEED:"slow",

    defaults: {
        height: "100%",
        width: "100%",
        autoClose: false,
        commitButtonSelector: "", // jquery selector for finding the btn to override inside the iframe
        cancelButtonSelector: "", // jquery selector for finding the btn to override inside the iframe
        iFrameSrc: ""  // src to add to the iframe when ready
    },

    init: function(parent) {
        this.iFrameSrc = this.config.iFrameSrc;
        this.iframe = $.create(this._iframe_template());
        this.loader = new acx.ui.LoadingBlocker({ waitingFrame: this.iframe });
        this._resetBody_handler();

        this._super(parent);

        this._initEvents();
    },

    _initEvents: function() {
        this.loader.on("loaderHidden", this._showIframe_handler);
        this.on("close", this._resetBody_handler);
        this.on("commit", this._resetBody_handler);
        this.on("open", this._setIframeSrc_handler);
        this.on("iFrameLoaded", this._bindEventsToButtonsInIframe_handler);
        this.iframe.load(function() {
            this.fire("iFrameLoaded", this);
        }.bind(this));
    },

    _bindEventsToButtonsInIframe_handler: function() {
        if (!acx.isEmpty(this.config.commitButtonSelector) || !acx.isEmpty(this.config.cancelButtonSelector)) {
            this.iFrameContent = this.iframe.contents();
            var btnCommit = this.iFrameContent.find(this.config.commitButtonSelector);
            if (btnCommit.length > 0) {
                btnCommit[0].onclick = null;
                btnCommit.on("click", this.commit_handler);
            }
            var btnCancel = this.iFrameContent.find(this.config.cancelButtonSelector);
            if (btnCancel.length > 0) {
                btnCancel[0].onclick = null;
                btnCancel.on("click", this.cancel_handler);
            }
        }
    },

    _setIframeSrc_handler: function() {
        $(this.config.parent).css({ overflowY: "hidden", overflowX: "hidden" });
        this.iframe.attr("src", this._buildSrc());
    },

    _buildSrc: function() {
        return this.iFrameSrc;
    },

    _resetBody_handler: function() {
        $(this.config.parent).css({ overflowY: "visible", overflowX: "visible" });
        this._showLoader();
        this.iframe.attr("src", null);
    },

    _showLoader: function() {
        this.iframe.hide();
        this.loader.show();
    },

    _showIframe_handler: function() {
        this.iframe.fadeIn(this.FADE_SPEED);
    },

    cancel_handler: function() {
        this._super();
        this.close();
    },

    _iframe_template: function() {
        var height = acx.isNumeric(this.config.height) ? (this.config.height - 3) + "px" : this.config.height;
        return { tag: 'IFRAME', id: this.id("iframe"), name: this.id("iframe"), frameBorder:'0', css: { height: height, width: this.config.width } };
    },

    _panel_template: function() {
        return { tag: "DIV", cls: "uiFullScreenPanel",
            css: { height: this.config.height, width: this.config.width },
            children: [ this.iframe, this.loader ] };
    },

    _getPosition: function() {
        return { top: 0, left: 0 };
    }
});

acx.ui.LoadingBlocker = acx.ui.Widget.extend({
    _id: "LoadingBlocker",
    FADE_SPEED: 150,

    defaults: {
        waitingFrame: "",
        autoShow: false
    },

    init: function(parent) {
        this._super();

        this.waitingFrame = $(this.config.waitingFrame);
        this.contentEl = $.create(this._content_template());
        this.el = $.create(this._main_template());

        this._initEvents();

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    _initEvents: function() {
        if (this.waitingFrame.length > 0) {
            this.waitingFrame.bind("load", this._finishedLoading_handler);
        }
    },

    _finishedLoading_handler: function() {
        this.fire("iframeLoaded", this);
        this.hide(this.FADE_SPEED, this._fireLoaded_handler);
    },

    _fireLoaded_handler: function() {
        this.fire("loaderHidden", this);
    },

    show: function(options) {
        if (options !== undefined) {
            if (options.content !== undefined) {
                this.setContent(options.content);
            }
            if (options.width !== undefined) {
                this.setWidth(options.width);
            }
        }

        this.el.show();
    },

    hide: function(speed, fn) {
        this.el.hide();
        this.reset();
        if (acx.isFunction(fn)) {
            fn();
        }
    },

    setContent: function(content) {
        if (!acx.browser.ie7 || typeof content === 'string') {
            this.contentEl.empty().append(content);
        }
    },

    setWidth: function(width) {
        this._storeWidth();
        this.contentEl.width(width);
    },

    reset: function() {
        this._resetContent();
        this._resetWidth();
    },

    _resetContent: function() {
        this.contentEl = $.create(this._content_template());
        this.el.empty().append(this.contentEl);
    },

    _storeWidth: function() {
        this.defaultCssWidth = this.defaultCssWidth || this.contentEl.css('width');
    },

    _resetWidth: function() {
        this.contentEl.css('width', this.defaultCssWidth);
    },

    _main_template: function() {
        return { tag: "DIV", cls: "uiLoadingBlocker", css: { display: this.config.autoShow ? "" : "none" }, id: this.id(), child:
            this.contentEl
        };
    },

    _content_template: function() {
        return { tag: "DIV", cls: "loader", text: acx.text("Widgets.Generics.Loading") };
    }
});

/**
 * Loading Blocker on the page can be removed only when explicitly called.
 */
acx.ui.ManualLoadingBlocker = acx.ui.LoadingBlocker.extend({
    _id: "ManualLoadingBlocker",

    init: function(parent) {
        this._super(parent);
    },

    hide: function(speed, fn) {
        this._super(speed, fn);
    },

    _finishedLoading_handler: function() {
        return false;
    }
});

/**
 * Loading Blocker to be shown on dialog panels.
 * Reason for not keeping it in DialogPanel widget is because it is needed also in legacy dialog panel
 */
acx.ui.DialogLoadingBlocker = acx.ui.ManualLoadingBlocker.extend({
    _id: "DialogLoadingBlocker",
    defaults: {
        dialog: null
    },
    _getCSS: function() {
        var dialogEl = this.config.dialog.el || this.config.dialog,
            dialogBody = dialogEl.find('.uiPanel-body');
        var height = dialogBody.height();
        var width = dialogEl.width();
        var offset = dialogBody.offset();

        return {
            left: dialogBody[0].offsetLeft,
            top: dialogBody[0].offsetTop,
            width: width,
            height: height,
            position: "absolute"
        };
    },
    show: function(options) {
        this.refresh();
        this._super(options);
    },
    refresh: function() {
        this.el.css(this._getCSS());
    }
});

acx.ui.UploadProgress = acx.ui.Widget.extend({
    defaults: {
        showTimeRemaining: true,
        isFormTable: false,
        showCancelButton: false
    },

    init: function(parent) {
        this._super();

        this.tableClass = this.config.isFormTable ? 'formTable' : '';
        this.cellClass = this.config.isFormTable ? 'messagecell' : '';
        this.contentCellClass = this.config.isFormTable ? 'contentcell' : '';

        this.progressBar = new acx.ui.ProgressBar();

        this.files = $.create(this._files_template());
        this.sent = $.create(this._sent_template());
        this.total = $.create(this._total_template());
        this.timeRemaining = $.create(this._timeRemaining_template());
        this.cancelButton = this.config.showCancelButton ? $.create(this._cancelButton_template()) : null;
        this.progressBarRow = this.config.isFormTable ? $.create(this._progressBarRow_template()) : null;
        this.progressBarFooter = !this.config.isFormTable ? $.create(this._progressBarFooter_template()) : null;

        this.el = $.create(this._main_template());

        if (parent) {
            parent.append(this.el);
        }
    },

    setFileNames: function(files) {
        if (!acx.isArray(files)) {
            files = [files];
        }
        this.files.empty().append($.create(files.map(this._fileName_template)));
    },

    updateProgressBar: function(percent) {
        this.progressBar.update(percent);
        this.centreProgressBarStatusLabel();
    },

    setProgressBarStatusLabel: function(text) {
        this.progressBar.setStatusLabel(text);
    },

    centreProgressBarStatusLabel: function() {
        this.progressBar.centreStatusLabel();
    },

    update: function(data) {
        this.uploadStartTime = this.uploadStartTime || new Date().getTime();

        if (data.files) {
            this.setFileNames(data.files);
        }

        if (data.sentBytes !== undefined && data.totalBytes !== undefined) {
            var time = new Date().getTime() - this.uploadStartTime, tp = data.sentBytes / (time / 1000), secRemaining = (data.totalBytes - data.sentBytes) / tp;

            this.sent.text(this._bytesForDisplay(data.sentBytes) + ' (' + this._bytesForDisplay(tp) + '/s)');
            this.total.text(this._bytesForDisplay(data.totalBytes));

            if (this.config.showTimeRemaining) {
                this._setTimeRemaining(this._timeForDisplay(secRemaining));
            }

            this.updateProgressBar(Math.round((data.sentBytes / data.totalBytes) * 100));
        }
    },

    _setTimeRemaining: function(time) {
        this.timeRemaining.text(time);
    },

    reset: function() {
        this.uploadStartTime = undefined;

        this.files.empty();
        this.sent.empty();
        this.total.empty();
        this.timeRemaining.empty();

        this.progressBar.update(0);
    },

    showCancelButton: function() {
        if (this.config.showCancelButton) {
            this.cancelButton.show();
        }
    },

    hideCancelButton: function() {
        if (this.config.showCancelButton) {
            this.cancelButton.hide();
        }
    },

    _bytesForDisplay: function(amount) {
        if (amount === undefined || isNaN(amount) || amount === Infinity) {
            return '';
        } else {
            if (amount > 1024 * 1024) {
                return Math.round((amount / (1024 * 1024)) * 100) / 100 + 'MB';
            } else if (amount > 1024) {
                return Math.round(amount / 1024) + 'kB';
            } else {
                return Math.round(amount) + ' bytes';
            }
        }
    },

    _timeForDisplay: function(seconds) {
        if (seconds === undefined || isNaN(seconds) || seconds === Infinity) {
            return '';
        } else {
            if (seconds <= 60) {
                return Math.round(seconds) + 's';
            } else if (seconds <= 60 * 60) {
                return Math.round(seconds / 60) + 'm';
            } else {
                return Math.round(seconds / 60 / 60) + 'h';
            }
        }
    },

    _cancel_handler: function() {
        this.fire('cancel');
    },

    _main_template: function() {
        return {tag: 'DIV', cls: 'uiUploadProgress ' + (this.config.showCancelButton ? 'uiUploadProgress-cancel' : ''), children: [
            {tag: 'TABLE', cls: this.tableClass, children: [
                {tag: 'TBODY', children: [
                    {tag: 'TR', children: [
                        {tag: 'TD', cls: this.cellClass, text: acx.text('Widgets.UploadProgress.FileName_label') },
                        this.files
                    ]},
                    {tag: 'TR', children: [
                        {tag: 'TD', cls: this.cellClass, text: acx.text('Widgets.UploadProgress.BytesSent_label') },
                        this.sent
                    ]},
                    {tag: 'TR', children: [
                        {tag: 'TD', cls: this.cellClass, text: acx.text('Widgets.UploadProgress.BytesTotal_label') },
                        this.total
                    ]},
                    this.config.showTimeRemaining ? {tag: 'TR', children: [
                        {tag: 'TD', cls: this.cellClass, text: acx.text('Widgets.UploadProgress.TimeRemaining_label') },
                        this.timeRemaining
                    ]} : null,
                    this.progressBarRow
                ]}
            ]},
            this.progressBarFooter
        ]};
    },

    _files_template: function() {
        return { tag: 'TD', cls: this.contentCellClass };
    },

    _fileName_template: function(fileName) {
        return { tag: 'DIV', text: fileName };
    },

    _sent_template: function() {
        return { tag: 'TD', cls: this.contentCellClass };
    },

    _total_template: function() {
        return { tag: 'TD', cls: this.contentCellClass };
    },

    _timeRemaining_template: function() {
        return { tag: 'TD', cls: this.contentCellClass };
    },

    _cancelButton_template: function() {
        return { tag: 'DIV', cls: 'cancel', title: acx.text('Widgets.Generics.Cancel.text'), onclick: this._cancel_handler };
    },

    _progressBarRow_template: function() {
        return { tag: 'TR', children: [
            { tag: 'TD', cls: this.cellClass },
            { tag: 'TD', cls: this.contentCellClass, children: [
                this.progressBar,
                this.cancelButton
            ] }
        ]};
    },

    _progressBarFooter_template: function() {
        return [this.progressBar, this.cancelButton];
    }
});

acx.ui.Lookup = acx.ui.Widget.extend({
    defaults: {
        // Allow to add distribution groups
        allowAddGroups: false,
        // Allow to add guest user
        allowGuests: true,
        // Allow single assignee display on the lookup result
        allowSingleAssigneeOnly: false,
        // current user id
        currentUserId: null,
        // allow to delete the current logon user from the lookup result
        deleteSelf: false,
        // if this is set to true, all the users, within the group, will be added once the
        // group has been clicked
        expandGroups: true,
        // Used to filter groups to a particular organisation
        groupOrgId: null,
        // lookup type - can be "User", "MailApprovalUser" or "Organization"
        lookupType: "User",
        // mini version of the lookup
        mini: true,
        // project id
        projectId: null,
        // read only
        readonly: false,
        // Is at least one selection required
        required: false,
        // The search scope of the lookup. It can be "ORG", "PROJECT_ORG" or "PROJECT"
        searchScope: "PROJECT"
    },

    /* START - Init Functions */
    init: function(parent) {
        this._super();
        this._initMessages();
        this._configValidation();
        this._renderUI(parent);
    },

    _initMessages: function() {
        acx.augment(this.config, {
            defaultFieldText_Message: acx.text("AddressLookup.EnterSearchQueryHere"),
            enterQueryInTextBox_Message: acx.text("AddressLookup.NoQueryEntered_alert"),
            addPersonFromProjectOrgTooltip_Message: acx.text("AddressLookup.AddPersonFromProjectOrg_alt"),
            enterSearchQueryTooltip_Message: acx.text("AddressLookup.EnterSearchQueryTooltip"),
            severalMatchesFound_Message: acx.text("AddressLookup.SeveralMatchesFound"),
            selectionFromList_Message: acx.text("AddressLookup.SelectFromList"),
            noneOfTheAbove_Message: acx.text("AddressLookup.NoneOfTheAbove"),
            removeThisList_Message: acx.i18n.formatKey("AddressLookup.RemoveThisList_Link",
                "<a href='#' class='clear'>", "</a>"),
            invalidUser_Message: acx.i18n.formatKey("AddressLookup.InvalidUser"),
            noMatchFound_Message: acx.text("AddressLookup.NoMatchFound"),
            tryLessSpecificQuery_Message: acx.i18n.formatKey("AddressLookup.TryLessSpecificOrRemove_Link",
                "<a href='#' class='clear'>", "</a>"),
            loadingMessage_Message: acx.text("AddressLookup.LookingUp")
        });
    },

    _initElements: function() {
        this.inputFieldEl = $.create(this._input_field_template());
        this.iconEl = $.create(this._icon_template());
        this.lookupFieldEl = $.create(this._lookup_field_template());
        this.dataGridContainerEl = $.create(this._data_grid_container_template());
        this.messagePanelContainerEl = $.create(this._message_panel_container_template());
        this.lookupResultEl = $.create(this._lookup_result_template());
        this._initDataGrid();
        this._initEvents();
    },

    _initDataGrid: function() {
        this.store = this.config.store;

        var enableGrouping = typeof this.config.groupResults !== "undefined" ? this.config.groupResults : false;

        // if store is not specified, create a new one
        if (!this.config.store) {
            this.store = new acx.data.LookupStore({
                reader: new acx.data.JsonReader({},
                    this._createLookupModel()),
                data: this.config.data,
                groupResults: enableGrouping,
                groupField: this.config.groupField || "",
                params: {
                    EXPAND_GROUPS: this.config.expandGroups,
                    LOOKUP_TYPE: this.config.lookupType,
                    PROJECT_ID: this.config.projectId,
                    SEARCH_SCOPE: this.config.searchScope
                }
            });
        }

        this.dataGrid = new acx.ui.LookupGrid(this.dataGridContainerEl, {
            enableGrouping: enableGrouping,
            groupRenderer: this.config.groupRenderer,
            store: this.store,
            columns: this.config.columns,
            showHeaderRow: this.config.showHeaderRow || false
        });

        this.store.on("loadLookupResult", this._loadLookupResult_handler);
        this.store.on("clear", this._clearMessagePanel.bind(this));
        this.store.on("addLookupResult", this._addLookupResult_handler);
        this.store.on("remove", this._removeLookupResult_handler);
    },

    _initEvents: function() {
        // lookup input field events
        this.inputFieldEl
            .bind("click", this._lookupInputClick_handler)
            .bind("blur", this._lookupInputBlur_handler)
            .bind("keypress", this._lookupInputKeyPress_handler);

        // lookup icon events
        this.iconEl.bind("click", this._lookupIconClick_handler);

        // lookup temp result events
        this.messagePanelContainerEl.bind("click", this._messagePanelClick_handler);
    },

    _renderUI: function(parent) {
        this._initElements();
        this.el = $.create(this._lookupMasterTemplate());
        if (parent) {
            this.appendTo(parent);
        }
        if (this.store.getCount() > 0) {
            // just clear the message panel if there are any results in the lookup
            this._clearMessagePanel();
        } else {
            // clear the lookup and hide all the message panels if no results in the lookup
            this.clear();
        }
        this._refreshLookup();
    },
    /* END - Init Functions */

    /* START - Templates */
    _lookupMasterTemplate: function() {
        var config = this.config;
        return { tag: "span", id: this.id(), cls: "lookup", css: { width: (config.width ? config.width : "auto") },
            children: [ this.lookupFieldEl,
                { tag: "span", cls: "lookup-buttons" },
                this.lookupResultEl ]
        };
    },

    _lookup_result_template: function() {
        return { tag: "div", cls: "lookup-result " +
            (this.config.groupResults ? "" : "large ") +
            (this.config.mini === true ? "lookup-mini" : ""), css: { width: (this.config.width ? this.config.width : "auto") },
            children: [ this.messagePanelContainerEl,
                this.dataGridContainerEl ]
        };
    },

    _message_panel_container_template: function() {
        return { tag: "div", cls: "lookup-message-panel" };
    },

    _data_grid_container_template: function() {
        return { tag: "div", cls: "lookup-result-grid", style:'padding:0' };
    },

    _lookup_field_template: function() {
        return { tag: "span", cls: "lookup-field uiField uiIconField medium" + (this.config.required ? " isRequired" : ""),
            children: [ this.iconEl,
                this.inputFieldEl
            ]
        };
    },

    _icon_template: function() {
        return { tag: "div", cls: "bicon ic-search", title: this._getTooltip()  };
    },

    _input_field_template: function() {
        return { tag: "input", type: "text", cls: "medium lookup-inputField" + (this.config.required ? " isRequired" : ""), value: this.config.defaultFieldText_Message, title: this._getTooltip() };
    },

    _lookupMultiMatchesPanelTemplate: function(data) {
        return { tag: "div", cls: "lookup-multimatches",
            children: [
                { tag: "span", text: acx.i18n.formatText(this.config.severalMatchesFound_Message, data.queryText) },
                { tag: "span", text: " - " + this.config.selectionFromList_Message },
                this._lookupTempResultListTemplate(data.rows),
                { tag: "span", children: [
                    { tag: "span", text: this.config.noneOfTheAbove_Message + " " },
                    { tag: "span", html: this.config.removeThisList_Message }
                ] }
            ] };
    },

    _lookupErrorMessagePanelTemplate: function(displayText) {
        return { tag: "div", cls: "lookup-error-message", html: displayText };
    },

    _lookupTempResultListTemplate: function(rows) {
        return { tag: "ul", children: rows };
    },

    // this template will generate a row of an assignee
    _lookupTempResultRowTemplate: function(data) {
        var type = data.guest === true ? "guest" : data.type;
        var list = { tag: "li", cls: "lookup-assignee " + "lookup-" + type, children: [] };

        // if the type is guest and allow to add guests
        if (type === "guest" && this.config.allowGuests === false) {
            list.children.push(this._createDisableRow(data.name));
        } else if (type === "group") {
            var allowAddGroups = this.config.allowAddGroups;
            if ((allowAddGroups === false && this.config.expandGroups === false) ||
                (allowAddGroups === false && data.group.length === 0)) {
                list.children.push(this._createDisableRow(data.name, true));
            } else if (this.config.allowSingleAssigneeOnly === true) {
                list.children.push({ tag: "strong", text: data.name});
            } else {
                list.children.push({ tag: "span", cls: "assignee_group textlink", text: data.name });
            }

            // if there are users in the group (data.group.length > 0),
            // then display a list of users, who belong to that group
            if (data.group.length > 0) {
                var id = data.type + "_" + data.id;
                var rows = this._createTempResultRows(data.group, id);
                var ul = this._lookupTempResultListTemplate(rows);
                list.children.push(ul);
            }
        }
        else {
            list.children.push({ tag: "span", cls: "assignee textlink", text: data.name });
        }
        return list;
    },
    /* END - Templates */

    /* START - Event Handlers */
    _addLookupResult_handler: function () {
        this._refreshLookup();
    },

    // capture the load event on the lookup result
    _loadLookupResult_handler: function(data) {
        this._hideLoadingMessage();
        this.messagePanelContainerEl.empty();

        var responses = data.responses;
        responses.forEach(function(response) {
            this._addMatches(response);
        }, this);
        this._refreshLookup();
    },

    _lookupInputKeyPress_handler: function(event) {
        if (event.which === 13) {
            this.lookup();
            return false;
        }
    },

    _lookupInputBlur_handler: function(event) {
        var target = $(event.target);
        if (this._isInputFieldEmpty()) {
            target.val(this.config.defaultFieldText_Message);
        }
        if (this.lookupFieldEl.hasClass("invalid") && this.store.getCount() > 0) {
            this.lookupFieldEl.removeClass("invalid");
        }
    },

    _lookupInputClick_handler: function(event) {
        var target = $(event.target);
        if (this._isDefaultFieldText()) {
            target.val("");
        }
    },

    // capture click on lookup icon
    _lookupIconClick_handler: function(event) {
        this.lookup();
    },

    // capture any clicks inside the Message Panel
    _messagePanelClick_handler: function(event) {
        var target = $(event.target), li;
        if (target.hasClass("assignee")) {
            li = target.closest("li");
            this.store.moveAssigneeToStore(li.data("info"), this.config.allowSingleAssigneeOnly);
            target.closest(".lookup-multimatches, .lookup-error-message").remove();
        } else if (target.hasClass("assignee_group")) {
            li = target.closest("li");
            this.store.moveGroupToStore(li.data("info"), this.config.allowAddGroups, this.config.expandGroups, this.config.allowGuests);
            target.closest(".lookup-multimatches, .lookup-error-message").remove();
        } else if (target.hasClass("clear")) {
            target.closest(".lookup-multimatches, .lookup-error-message").remove();
        }
        this._refreshLookup();
        return false;
    },

    _removeLookupResult_handler: function() {
        this._refreshLookup();
    },
    /* END - Event Handlers */

    /* START - Private Methods */
    /**
     * This function handles the result that come back from the lookupAjax control
     */
    _getTooltip: function() {
        return this.config.searchScope === "PROJECT_ORG" ?
            this.config.addPersonFromProjectOrgTooltip_Message :
            this.config.enterSearchQueryTooltip_Message;
    },

    _addMatches: function(response) {
        var matches = response.matches;
        // if only one match found and the match is not a group,
        // display the result in the lookup result panel
        if (matches.length === 1 && acx.isEmpty(matches[0].group)) {
            // if allowGuests options is false and the assignee that user searched is a
            // guest user, display an error message
            var match = matches[0];
            if (this.config.allowGuests === false && match.guest === true) {
                this._addErrorMessagePanel(match.name + " - " + this.config.invalidUser_Message + " " +
                    this.config.tryLessSpecificQuery_Message);
            } else {
                this.store.addAssignees(matches, this.config.allowSingleAssigneeOnly);
            }
            this.inputFieldEl.val("");
        }
        // if there is more than one matches, display multiple result panel
        else if (matches.length >= 1) {
            this._addMultiMatchesPanel(response);
            this.inputFieldEl.val("");
        }
        // if no matches, display validation message
        else {
            var noMatchFoundMsg = acx.i18n.formatText(this.config.noMatchFound_Message, response.queryText) + " " +
                this.config.tryLessSpecificQuery_Message;
            this._addErrorMessagePanel(noMatchFoundMsg);
        }
    },

    _addMultiMatchesPanel: function(data) {
        var panel = this.messagePanelContainerEl;
        data.rows = this._createTempResultRows(data.matches);
        panel.prepend($.create(this._lookupMultiMatchesPanelTemplate(data)));
    },

    _addErrorMessagePanel: function(displayText) {
        var messagePanel = $.create(this._lookupErrorMessagePanelTemplate(displayText));
        this.messagePanelContainerEl.prepend(messagePanel);
    },

    _clearMessagePanel: function() {
        this.messagePanelContainerEl.empty();
    },

    _configValidation: function() {
        var lookupType = this.config.lookupType, searchScope = this.config.searchScope;

        if (lookupType !== "User" && lookupType !== "MailApprovalUser" && lookupType !== "Organization") {
            throw new Error("lookupType has to be either 'User', 'MailApprovalUser' or 'Organization'");
        }

        if (searchScope !== "ORG" && searchScope !== "PROJECT_ORG" && searchScope !== "PROJECT") {
            throw new Error("searchScope has to be either 'ORG', 'PROJECT_ORG' or 'PROJECT'");
        }
    },

    _createDisableRow: function(name, isBold) {
        return { tag: "span", cls: "disabled" + (isBold === true ? " bold" : ""), text: name };
    },

    _createLookupModel: function() {
        var defaultFields = [
            { name: 'id' },
            { name: 'name' },
            { name: 'type' },
            { name: 'group' },
            { name: 'guest' },
            { name: 'shadow' }
        ];
        return acx.data.Record.create(this.config.fields || defaultFields);
    },

    // create a list of temporary result rows
    _createTempResultRows: function(arr, groupId) {
        var rows = [];
        arr.forEach(function(rowData) {
            var row = this._lookupTempResultRowTemplate(rowData);
            var id = rowData.type + "_" + rowData.id;
            if (row !== false) {
                rows.push($.create(row).data("info", { id: id, groupId: groupId }));
            }
        }, this);
        return rows;
    },

    _isInputFieldEmpty: function() {
        return this.inputFieldEl.val().length === 0;
    },

    _isDefaultFieldText: function() {
        return this.config.defaultFieldText_Message === this.inputFieldEl.val();
    },

    _hideLoadingMessage: function() {
        this.loadingPanel.remove();
    },

    _refreshLookup: function() {
        var noOfElementsInMessagePanel = this.messagePanelContainerEl.children().length;
        var noOfSelectedResults = this.store.getCount();
        if (noOfElementsInMessagePanel > 0 || noOfSelectedResults > 0) {
            this.lookupResultEl.show();
        } else {
            this.lookupResultEl.hide();
        }
        this.messagePanelContainerEl[noOfElementsInMessagePanel > 0 ? "show" : "hide"]();

        // remove "invalid" class if lookup is not empty
        if (noOfSelectedResults > 0) {
            this.dataGridContainerEl.show();
            this.inputFieldEl.removeClass("invalid");
        } else {
            this.dataGridContainerEl.hide();
        }
    },

    _showLoadingMessage: function(value) {
        this.loadingPanel = $.create(acx.ut.loadingMessage(this.config.loadingMessage_Message + ": " + value));
        this.messagePanelContainerEl.prepend(this.loadingPanel);
        this._refreshLookup();
    },

    /* END - Private Methods */

    /* START - Public Methods */
    clear: function() {
        this._clearMessagePanel();
        this.store.removeAll();
        this.lookupResultEl.hide();
        this.dataGridContainerEl.hide();
    },

    lookup: function() {
        var value = this.inputFieldEl.val();
        if ((value.trim().length > 0) && !this._isDefaultFieldText()) {
            this._showLoadingMessage(value);
            this.store.filter(value);
            this.fire("lookup", { source: this });
        } else {
            this.inputFieldEl.get(0).blur();
            alert(this.config.enterQueryInTextBox_Message);
        }
    },

    collectRecordIds: function() {
        return this.store.collect('id');
    },

    setInvalid: function(invalid) {
        this.lookupFieldEl[invalid ? "addClass" : "removeClass"]("invalid");
    },

    val: function(values) {
        if (values === undefined || values === null) {
            return this.collectRecordIds();
        } else {
            this.store.loadData(values);
            this._refreshLookup();
        }
    }
    /* END - Public Methods */
});

acx.ui.Bidi = acx.ui.Widget.extend({
    _id: "Bidi",

    defaults: {
        enableFilter: true,     // enable filter
        listSize: 8,            // number of items in the select boxes
        items: null,            // (required) an array of items { text, value, [ selected ] }
        width: 600,             // width of the widget in pixels
        required: false,         // shows the required *
        showOrdering: false,
        selectionLimit: 0
        //     leftTitleText:          // the title of the left list
        //     rightTitleText:         // the title of the right list
        //     itemTypeKey:            // the type of thing in the list
    },

    showLimit: 200,             // maximum number of items to show in the available lists column (based on performance of ie6)

    init: function(parent) {
        this._super();

        this.itemStore = new acx.data.Store({
            reader: new acx.data.JsonReader({idProperty: "value" }, acx.data.Record.create(
                [
                    { name: "text" },
                    { name: "value" },
                    { name: "selected", defaultValue: false },
                    { name: "filtered", defaultValue: false },
                    {name: "fixed", defaultValue: false}
                ],
                { asOption: this._itemRecordAsOption }
            ))
        });
        this.itemStore.on("load", this._rebuildLists_handler);
        if (this.config.showOrdering) {
            this.itemStore.on("datamoved", this._moveSelectedOptions_handler);
        }
        this.showPaging = this.config.items.length > this.showLimit;
        this.page = 1;
        this.availableList = $.create(this._avail_template());
        this.selectedList = $.create(this._selec_template());
        this.filter = this.config.enableFilter ? this._filter_template() : null;
        this.selectOffsetWidth = this.config.showOrdering ? -40 : -30;
        this.addButton = new acx.ui.Button({id: this.config.id + "_add", labelText: ">>", onclick: this._addItem_handler, tooltipKey: "Widgets.Bidi.AddToList.tooltip" });
        this.removeButton = new acx.ui.Button({id: this.config.id + "_remove", labelText: "<<", onclick: this._removeItem_handler, tooltipKey: "Widgets.Bidi.RemoveFromList.tooltip" });
        this.el = $.create(this._main_template());

        this.itemStore.loadData(this.config.items);

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    getItems: function() {
        return this.itemStore.getAllData();
    },

    setItems: function(items) {
        this.itemStore.loadData(items);
    },

    // interface ( public methods )
    getSelectedValues: function() {
        var ret = [];
        this.itemStore.each(function(item) {
            if (item.data.selected) {
                ret.push(item.data.value);
            }
        });
        return ret;
    },

    getSelectedText: function() {
        var ret = [];
        this.itemStore.each(function(item) {
            if (item.data.selected) {
                ret.push(item.data.text);
            }
        });
        return ret;
    },

    setSelectedValues: function(values) {
        this.itemStore.each(function(item) {
            item.data.selected = values.contains(item.data.value);
        });
        this._rebuildLists_handler();
    },

    // controller code ( handlers )
    _addItem_handler: function(jEv) {
        var selOpts = this.availableList.find("OPTION:selected");
        if (this.config.selectionLimit > 0 && (selOpts.length + this.selectedCount) > this.config.selectionLimit) {
            this.fire("selectionLimitExceeded", { selectedCount: this.selectedCount, selectedAvailable: selOpts.length, selectionLimit: this.config.selectionLimit }, this);
            return;
        }
        for (var i = 0, opts = this.availableList[0].options, sel = []; i < opts.length; i++) {
            if (opts[i].selected) {
                if (acx.isEmpty(opts[i].value)) {
                    opts[i].selected = false;
                } else {
                    if (this.config.showOrdering) {
                        this._selectOrdered(opts[i].value);
                    } else {
                        this.itemStore.getById(opts[i].value).data.selected = true;
                    }
                }
            }
        }
        this._rebuildLists_handler();
    },

    _removeItem_handler: function(jEv) {
        for (var i = 0, opts = this.selectedList[0].options, sel = []; i < opts.length; i++) {
            if (opts[i].selected && opts[i].value && !opts[i].disabled) {
                if (this.config.showOrdering) {
                    this._unselectOrdered(opts[i].value);
                } else {
                    this.itemStore.getById(opts[i].value).data.selected = false;
                }
            }
        }
        this._rebuildLists_handler();
    },

    _selectOrdered: function(value) {
        var firstNotSelectedIndex = this.itemStore.find("selected", false);
        var selectedOption = this.itemStore.getById(value);
        selectedOption.data.selected = true;
        this.itemStore.insert(firstNotSelectedIndex, selectedOption);
    },

    _unselectOrdered: function(value) {
        var firstNotSelectedIndex = this.itemStore.find("selected", false);
        var selectedOption = this.itemStore.getById(value);
        selectedOption.data.selected = false;
        this.itemStore.insert(this.itemStore.getCount() - 1, selectedOption);
    },

    _filter_handler: function(textField) {
        var match = new RegExp(textField.val().escapeRegExp().replace(/\s+/g, ".*"), "i");
        this.itemStore.each(function(item) {
            item.data.filtered = ! match.test(item.get("text"));
        });
        this.page = 1;
        this._rebuildLists_handler();
    },

    _moveSelectedOptions_handler: function(event) {
        var option = this.selectedList.find("OPTION[value='" + event.id + "']");
        if (event.direction === "down") {
            option.insertAfter(option.next());
        } else {
            option.insertBefore(option.prev());
        }
        this.fire("change", this);
    },

    _rebuildLists_handler: function() {
        var available = 0, filtered = 0, first = 1 + (this.page - 1) * this.showLimit, last = first + this.showLimit - 1;

        this.selectedCount = 0;
        this.availableList.empty();
        this.selectedList.empty();
        this.itemStore.each(function(item, i) {
            if (item.get("selected") && this._isSelectedBelowSelectionLimit()) {
                this.selectedList[0].options.add(item.asOption(), -1);
                this.selectedCount++;
            } else {
                available++;
                if (item.get("filtered") === false) {
                    filtered++;
                    if (filtered >= first && filtered <= last) {
                        this.availableList[0].options.add(item.asOption(), -1);
                    }
                }
            }
        }, this);
        last = Math.min(last, filtered);
        first = Math.min(first, filtered);
        $(".uiBidi-filterMessage", this.el).text(filtered < available ? acx.text("Widgets.Bidi.Filter", filtered, available) : "");
        $(".uiBidi-pagingMessage", this.el).text(acx.text("Widgets.Bidi.Paging", first, last, filtered));
        $(".uiBidi-prev", this.el).toggleClass("textlink", this.page > 1);
        $(".uiBidi-next", this.el).toggleClass("textlink", last < filtered);
        if (acx.browser.ie6 && this.selectedList[0].length === 0) {
            this.selectedList[0].options.add(new Option(""), -1); // add a blank option to prevent option list from collapsing in ie6
        }
        if (this.config.selectionLimit > 0) {
            this.addButton[this.selectedCount >= this.config.selectionLimit ? "disable" : "enable"]();
        }
        this.fire("change", this);
    },

    _isSelectedBelowSelectionLimit: function() {
        return this.config.selectionLimit === 0 || (this.config.selectionLimit > 0 && this.selectedCount < this.config.selectionLimit);
    },

    _paging_prev_handler: function(jEv) {
        if (jEv.target.className.contains("textlink")) {
            this.page -= 1;
            this._rebuildLists_handler();
        }
        return false;
    },

    _paging_next_handler: function(jEv) {
        if (jEv.target.className.contains("textlink")) {
            this.page += 1;
            this._rebuildLists_handler();
        }
        return false;
    },

    _moveUpItem_handler: function(jEv) {
        this.selectedList.find("OPTION:selected").get().forEach(function(opt, i) {
            var jOpt = $(opt);
            if (!jOpt.prop("disabled") && jOpt.prev().length > 0 && !jOpt.prev().prop("disabled")) {
                this.itemStore.moveUp(opt.value);
            }
        }.bind(this));
    },

    _moveDownItem_handler: function(jEv) {
        this.selectedList.find("OPTION:selected").get().reverse().forEach(function(opt, i) {
            var jOpt = $(opt);
            if (!jOpt.prop("disabled") && jOpt.next().length > 0 && !jOpt.next().prop("disabled")) {
                this.itemStore.moveDown(opt.value);
            }
        }.bind(this));
    },

    // view code ( templates )
    _main_template: function() {
        return (
        { tag: "DIV", id: this.config.id, cls: "uiBidi clearFloats", css: { width: this.config.width + "px" }, children: [
            (this.config.showOrdering ? this._ordering_template() : null),
            { tag: "DIV", cls: "uiBidi-left", css: { width: (this.selectOffsetWidth + this.config.width / 2) + "px" }, children: [
                { tag: "DIV", cls: "uiBidi-leftHeader", children: [
                    { tag: "SPAN", text: this.config.leftTitleText || acx.text("Widgets.Bidi.Available_types", acx.text(this.config.itemTypeKey) || "") },
                    acx.ut.required(this.config.required),
                    { tag: "SPAN", cls: "uiBidi-filterMessage" }
                ] },
                this.filter,
                this.availableList,
                this.showPaging ? this._paging_template() : null
            ] },
            { tag: "DIV", cls: "uiBidi-right", css: { width: (this.selectOffsetWidth + this.config.width / 2) + "px" }, children: [
                { tag: "DIV", cls: "uiBidi-rightHeader", text: this.config.rightTitleText || acx.text("Widgets.Bidi.Selected_types", acx.text(this.config.itemTypeKey) || "") },
                this.selectedList
            ] },
            { tag: "DIV", cls: "uiBidi-actions", css: { paddingTop: (6 * this.config.listSize - 17) + "px" }, children: [
                this.addButton.el,
                { tag: "BR" }, { tag: "BR" },
                this.removeButton.el
            ] }
        ] }
            );
    },

    _avail_template: function() {
        return (
        { tag: "SELECT", multiple: true,
            cls: this.config.required ? "isRequired" : null,
            size: this.config.listSize + (this.config.enableFilter ? -2 : 0) + (this.showPaging ? -1 : 0),
            css: { height: acx.browser.ie67 ? "auto" : (this.config.listSize * 14) + (this.config.enableFilter ? -19 : 0) + (this.showPaging ? -20 : 0) + 'px' },
            ondblclick: this._addItem_handler }
            );
    },

    _selec_template: function() {
        return (
        { tag: "SELECT", multiple: true,
            cls: this.config.required ? "isRequired" : null,
            css: { height: acx.browser.ie67 ? "auto" : (this.config.listSize * 14) + 'px' },
            size: this.config.listSize, ondblclick: this._removeItem_handler  }
            );
    },

    _filter_template: function() {
        return new acx.ui.TextField({
            hintText: acx.text("Widgets.Bidi.FilterHint"),
            icon: "search",
            width: ((this.config.showOrdering ? -48 : -38) + this.config.width / 2),
            onEdit: this._filter_handler
        });
    },

    _paging_template: function() {
        return (
        { tag: "DIV", cls: "uiBidi-paging", children: [
            { tag: "SPAN", cls: "uiBidi-prev", css: { cssFloat: "left" }, text: "< " + acx.text("Widgets.Bidi.ListNavigator.previous"), onclick: this._paging_prev_handler },
            { tag: "SPAN", cls: "uiBidi-next", css: { cssFloat: "right" }, text: acx.text("Widgets.Bidi.ListNavigator.next") + " >" , onclick: this._paging_next_handler },
            { tag: "SPAN", cls: "uiBidi-pagingMessage", text: "" }
        ] }
            );
    },

    _ordering_template: function() {
        return { tag: "DIV", cls: "uiBidi-ordering", css: { float: "right", paddingTop: (6 * this.config.listSize - 17) + "px", paddingLeft: "5px" }, children: [
            new acx.ui.Button({id: this.config.id + "_moveUp", labelKey: "Widgets.Bidi.MoveUpList.text", onclick: this._moveUpItem_handler, tooltipKey: "Widgets.Bidi.MoveUpList.tooltip" }).el,
            { tag: "BR" }, { tag: "BR" },
            new acx.ui.Button({id: this.config.id + "_moveDown", labelKey: "Widgets.Bidi.MoveDownList.text", onclick: this._moveDownItem_handler, tooltipKey: "Widgets.Bidi.MoveDownList.tooltip" }).el
        ] };
    },

    // converts a acx.data.Record into an Option
    _itemRecordAsOption: function() { // 'this' is an instance of acx.data.Record
        var o = new Option(this.data.text, this.data.value, false);
        o.title = this.data.text;
        if (this.data.fixed) { //sets the option to be unselectable
            $(o).prop("disabled", true);
        }
        return o;
    }

});

acx.ui.AbstractField = acx.views.View.extend({
    _id: "AbstractField",
    defaults: {
        name: "",         // (required) the name of the form element that will be submitted
        value: "",        // initial value of the field
        require: false,   // is a value required when validation performed
        showEdited: false, //add edited class to widget on change of value
        showInvalid: true,  //add invalid class to widget on failure of validate function
        disable: false,
        setTabIndex: false,
        calloutContent: null
    },

    shared: { tabIndex: 0 },

    init: function() {
        this._super();

        var index = this.shared.tabIndex;
        if (this.config.setTabIndex && index !== -1) {
            this.shared.tabIndex++;
        }

        this.enableEditHandler(this.config.showEdited);

        if (this.model && this.modelField) {
            var fields = acx.isFunction(this.model.fields) && this.model.fields();

            this.require = this.config.require = (
                fields &&
                fields[this.modelField] &&
                fields[this.modelField].mandatory);

            if(this.config.value) {
                this.model.set(this.modelField, this.config.value, true);
            }

            this.on('change', function() {
                this._firstChangeOrValidation_handler('change');
            }.bind(this));

            this.model.on('validate', function() {
                this._firstChangeOrValidation_handler('validate');
            }.bind(this));
        } else {
            this.require = this.config.require;
        }

        // Add callout if needed
        if (this.config.calloutContent) {
            this.calloutIcon = $.create(this._calloutIcon_template());

            this.calloutIcon.click(this._calloutIconClick_handler);
        }
    },

    _calloutIconClick_handler: function() {
        this.callout = this.callout || new acx.ui.Callout({
            caller: this.calloutIcon,
            content: this.config.calloutContent
        });
        this.callout.show();
    },

    _firstChangeOrValidation_handler: function(type) {
        this._bindModelValidationEvents(type);
        this._firstChangeOrValidation_handler = $.noop;
    },

    _bindModelValidationEvents: function(type) {
        this.model.on('validatefield.' + this.modelField, function() {
            this._setValidating(true);
            this.setInvalid(false);
        }.bind(this)).on('validfield.' + this.modelField, function() {
            this._setValidating(false);
            this.setInvalid(false);
        }.bind(this)).on('invalidfield.' + this.modelField, function(jEv) {
            this._setValidating(false);
            this.setInvalid(true, jEv && jEv.errorMessage, jEv && jEv.reason);
        }.bind(this));

        if (type === 'change') {
            this.model.validate(this.modelField, this.val());
        }
    },

    _generateErrorMessage: function() {
        if (this.errorEl === undefined) {
            this.errorEl = $.create(this._errorMessage_template());
        }
    },

    _showErrorMessage: function(msg) {
        if (msg === undefined || this.el === undefined) {
            return;
        }

        this._generateErrorMessage();

        this.errorEl.text(msg).show().insertAfter(this.el);
    },

    _hideErrorMessage: function() {
        if (this.errorEl !== undefined) {
            this.errorEl.hide();
        }
    },

    _isEmpty: function() {
        var val = this.val();
        if (acx.isEmpty(val)) {
            return true;
        } else if (acx.isNumeric(val)) {
            return false;
        }
    },

    _setEdited_handler: function(jEv) {
        this.setEdited(true);
        this._setInvalid(false);
    },

    enableEditHandler: function(enable) {
        if (enable) {
            this.on("change", this._setEdited_handler);
        } else {
            this.removeObserver("change", this._setEdited_handler);
        }
    },

    setEdited: function(edited) {
        this.el[edited ? "addClass" : "removeClass"]("edited");
    },

    _setValidating: function() {
    },

    _setInvalid: function(invalid, errorMessage, reason) {
        if (this.config.showInvalid) {
            if (invalid && errorMessage !== undefined && reason !== 'mandatory') {
                this._showErrorMessage(errorMessage);
            } else {
                this._hideErrorMessage();
            }

            this.el[invalid ? 'addClass' : 'removeClass']("invalid");
        }
    },

    setInvalid: function(invalid, errorMessage, reason) {
        if (invalid) {
            this.fire("invalidfield");
        }

        this._setInvalid(invalid, errorMessage, reason);
    },

    setRequired: function(require) {
        this.require = require;
        this.el.toggleClass("isRequired", require);
    },

    // this function should be overridden in implementing classes
    val: function(value) {
        var field = (this.el.attr("name") === this.config.name) ? this.el : this.el.find("[name=" + this.config.name + "]");
        if (value === undefined) {
            return field.val();
        } else {
            field.val(value);
        }
    },

    validate: function() {
        if (!this.require || !this._isEmpty()) {
            this._setInvalid(false);
            return true;
        } else {
            this._setInvalid(true);
            return false;
        }
    },

    _errorMessage_template: function() {
        return { tag: 'DIV', cls: "error"};
    },

    _calloutIcon_template: function() {
        return {
            tag: 'div',
            cls: 'info-icon'
        };
    }
});

acx.ui.AbstractTextField = acx.ui.AbstractField.extend({
    _id: "AbstractTextField",
    defaults: {
        maxLength: undefined,
//        showEdited: false
        characterLimit: undefined
    },

    init: function(parent) {
        if (this.config.model && this.config.modelField && !this.config.maxLength) {
            this.config.maxLength = this.config.model.fields &&
                this.config.model.fields() &&
                this.config.model.fields()[this.config.modelField] &&
                this.config.model.fields()[this.config.modelField].maxLength;
        }

        this._super();

        this.lastChange = "";
        this.lastEdit = "";

        this.characterLimit = this.config.characterLimit || null;
        if(this.characterLimit) {
            this.characterCounter = $.create(this._character_counter_template());
            this.on("edit", function() {
                var charactersEntered = this.field.val().length;
                var characterCount = this.characterLimit - charactersEntered;
                this.characterCountField.text(characterCount.toString());
                var characterLimitExceeded = characterCount < 0;
                this.characterCounter['addClass'](characterLimitExceeded ? "error" : "characterCounter");
                this.characterCounter['removeClass'](characterLimitExceeded ? "characterCounter" : "error");
            });
        }

    },

    _initEvents: function() {
        this.field
            .bind("keyup", this._edit_handler)
            .bind("focus", this._focus_handler)
            .bind("blur", this._blur_handler)
            .bind("paste", this._paste_handler);
    },

    val: function(value) {
        if (value === undefined) {
            return this.field.hasClass("hint") ? "" : this.field.val();
        } else {
            this._focus_handler();
            this.field.val(value);
            this._edit_handler();
            this._blur_handler();
        }
    },

    _calcMaxLength: function() {
        return this.config.maxLength; //Overridden by TextArea widget to fix '\n\r' issue.
    },

    clear: function() {
        this.val("");
    },

    focus: function() {
        this.field[0].focus();
    },

    _edit_handler: function(jEv) {
        var val = this.field.val();
        if (val.length > this._calcMaxLength()) {
            val = val.substring(0, this._calcMaxLength());
            this.field.val(val);
            jEv && jEv.preventDefault();
        }
        if (this.lastEdit !== val) {
            this.lastEdit = val;
            this.fire("edit", this);
        }
    },

    _paste_handler: function(jEv) {
        this._triggerEditAfterPaste(jEv);
    },

    _triggerEditAfterPaste: function(jEv) {
        var that = this;
        setTimeout(function() {
            that._edit_handler(jEv);
        }, 1);
    },

    _blur_handler: function(jEv) {
        this.fire("blur", this, { jEv: jEv });
        if (this.lastChange !== this.field.val()) {
            this.fire("change", this, { lastVal: this.lastChange, jEv: jEv });
            this.lastChange = this.field.val();
        }
        this._checkHintText();
    },

    _focus_handler: function(jEv) {
        if (this.field.hasClass("hint")) {
            this.field.removeClass("hint").val("");
        }
        this.lastChange = this.field.val();
    },

    _checkHintText: function() {
        if (acx.isEmpty(this.field.val()) && !acx.isEmpty(this.config.hintText)) {
            this.field.addClass("hint").val(this.config.hintText);
        }
    },

    _character_counter_template: function() {
        this.characterCountField = $.create(this._character_count_field_template());
        return ({
            tag: "DIV", cls: "characterCounter",
            child: this.characterCountField
        });
    },

    _character_count_field_template: function() {
        return ({
            tag: "SPAN", text: this.characterLimit.toString()
        });
    }

});

acx.ui.TextField = acx.ui.AbstractTextField.extend({
    _id: "TextField",
    defaults: {
        //     name:           // (required) field name
        //     require: false  // validation command
        //     value: ""       // initial value of the field
        //     tooltip: null   // Tooltip
        hintText: "",   // hint text to show when there is no value (when the user has not entered any text)
        icon: "none",   // name of an ic_ icon (refer to widgets.css)
        width: undefined,     // This is the total width of the widget. Defining "width" will override "size"
        size: "medium",        // size of the widget (e.g. "small", "medium" and "large"
        showFullContextPopup: false
        //     maxLength:      // (inherited) the maximum size (in characters) of input
        //     showEdited: false
    },

    baseClass: "uiTextField",

    init: function(parent) {
        this._super();

        if (this.config.showFullContextPopup) {
            this.fullContextPopup = $.create(this._fullContextPopup_template()).hide();
        }
        this.field = $.create(this._field_template());
        this.el = $.create(this._main_template());
        if (this.config.disable) {
            this.disable();
        }

        if (parent) {
            this.el.appendTo(parent);
        }

        !acx.isEmpty(this.config.value) && this.field.val(this.config.value);
        this._checkHintText();

        this._initEvents();
    },

    disable: function() {
        this.disabled = true;
        this.el.addClass("disabled");
        this.field.prop("disabled", true);
    },

    enable: function() {
        this.disabled = false;
        this.el.removeClass("disabled");
        this.field.prop("disabled", false);
    },

    _iconClick_handler: function(jEv) {
        if (!this.disabled) {
            this.fire("iconClick", this, { jEv: jEv });
        }
    },

    _initEvents: function() {
        this._super();
        this.el.find(".bicon:first").bind("click", this._iconClick_handler);
        this.field.bind("keypress", this._enterCapture_handler);
    },

    _setValidating: function(isValidating) {
        this.el[isValidating ? 'addClass' : 'removeClass']('validating');
    },

    _edit_handler: function(jEv) {
        this._super(jEv);
        this._showFullContext();
    },

    _focus_handler: function(jEv) {
        this._super(jEv);
        this._showFullContext();
    },

    _blur_handler: function(jEv) {
        this._super(jEv);
        if (this.config.showFullContextPopup) {
            this.fullContextPopup.hide();
        }
    },

    _showFullContext: function() {
        if (this.config.showFullContextPopup) {
            if (! this.popupInitialHeight) {
                this.fullContextPopup.text("-");
                this.popupInitialHeight = this.fullContextPopup.height();
            }
            this.fullContextPopup.text(this.val());
            this.fullContextPopup[this.fullContextPopup.height() <= this.popupInitialHeight || this.val() === "" ? "hide" : "show"]();
        }
    },

    _enterCapture_handler: function(jEv) {
        if (jEv.which === 13) {
            jEv.preventDefault();

            // Cause native change event to fire
            this.field.blur().focus();

            this.fire("enterPress", this, { jEv: jEv });
        }
    },

    _fullContextPopup_template: function() {
        return {
            tag: "DIV",
            cls: "contextPopup hint " + this.config.size
        };
    },

    _field_template: function() {
        return (
        { tag: "INPUT",
            name: this.config.name,
            type: "text",
            maxLength: this.config.maxLength,
            cls: this.baseClass + "-input",
            tabindex: this.config.setTabIndex ? this.shared.tabIndex : null,
            title: this.config.tooltip,
            autoComplete: this.config.showFullContextPopup ? "off" : "on",
            css: {
                width: isNaN(this.config.width) ? this.config.width : (this.config.width - (acx.browser.ie6 ? 5 : 2) - (this.config.icon === "none" ? 0 : 24)) + "px"
            }
        }
            );
    },

    _main_template: function() {
        return (
        { tag: "DIV", id: this.id(), cls: this.baseClass + " uiField " + (this.config.width ? "" : this.config.size) + (this.config.icon !== "none" ? " uiIconField" : "") + (this.config.require ? " isRequired" : ""), css: { width: isNaN(this.config.width) ? this.config.width : this.config.width + "px" }, child: [
            this.config.icon !== "none" ? acx.ut.buttonIcon(this.config.icon) : null,
            this.fullContextPopup,
            this.field
        ] }
            );
    }
});

acx.ui.PasswordField = acx.ui.TextField.extend({
    _id: "PasswordField",
    baseClass: "uiPasswordField",

    _field_template: function() {
        var template = this._super();

        template.type = "password";

        return template;
    }
});


acx.ui.TextAreaField = acx.ui.AbstractTextField.extend({
    _id: "TextArea",
    defaults: {
        //     id:            // (inherited) id of the textarea field
        //     name:          // (required) field name
        //     value: ""      // (inherited) initial value of the field
        //     height: 400,   // the height of the widget
        //     width: 300,    // the width of the widget
        size: "",       // css class for controlling size of text area
        rows: 2
        //     maxLength      // (inherited) the maximum size (in characters) of input
        //     showEdited: false
    },

    baseClass: "uiTextAreaField",

    init: function(parent) {
        this._super();

        this._initElements();
        if (parent) {
            this.el.appendTo(parent);
        }

        if (!acx.isEmpty(this.config.value)) {
            this.field.val(this.config.value);
        }

        this._initEvents();
    },

    _initElements: function() {
        this.field = $.create(this._field_template());
        this.el = $.create(this._main_template());
    },

    _initEvents: function() {
        this._super();
        this.field.bind("keypress", this._maxLength_handler);
    },

    setEdited: function(edited) {
        this.field[edited ? 'addClass' : 'removeClass']("edited");
    },

    _setInvalid: function(invalid) {
        this.field[invalid ? 'addClass' : 'removeClass']("invalid");
    },

    _calcMaxLength: function() {
        return this.config.maxLength - (this.val().split("\n").length - 1);
    },

    _maxLength_handler: function(jEv) {
        if (this.field.val().length >= this._calcMaxLength() && jEv.metaKey === false && jEv.which >= 13) {
            jEv.preventDefault();
        }
    },

    _field_template: function() {
        return (
        { tag: "TEXTAREA",
            name: this.config.name,
            cls: this.baseClass + "-field " + (this.config.require ? " isRequired " : "") + (this.config.size ? this.config.size : ""),
            maxlength: this.config.maxLength,
            rows: this.config.rows,
            css: {
                width: "99%",
                height: "99%"
            },
            tabindex: this.config.setTabIndex ? this.shared.tabIndex : null
        }
            );
    },

    _main_template: function() {
        return (
        { tag: "DIV", id: this.id(), cls: this.baseClass, css: {
            width: isNaN(this.config.width) ? this.config.width : this.config.width + "px",
            height: isNaN(this.config.height) ? this.config.height : this.config.height + "px"
        }, children: [
                this.field,
                this.characterCounter
            ]
        }
        );
    }
});

acx.ui.DocumentNumberField = acx.ui.TextField.extend({
    _id: "DocumentNumberField",
    defaults: {
        documentId: "0",
        numberType: "MANUAL",
        readOnly: false,
        hideAutoNumberChk: false
        //     showFullContextPopup
        //     maxLength
        //     showEdited: false
    },

    baseClass: "uiDocumentNumberField",

    init: function(parent) {
        this.autoNumberChk = new acx.ui.CheckboxField("", {
            id: this.config.name + "_auto_" + this.config.documentId,
            name: this.config.name + "_auto_" + this.config.documentId,
            tooltip: this.config.tooltip,
            checked: this.config.numberType !== "MANUAL",
            label: acx.text("Widgets.DocumentNumberField.AutoNumber"),
            setTabIndex: this.config.setTabIndex
        });
        this.numberScheme = $.create({ tag: "INPUT", type: "hidden", name: this.config.name + "_numbertype_" + this.config.documentId, value: this.config.numberType });
        this._super(parent);

        this.setMode(this.numberScheme.val());

        !this.config.readOnly && this.autoNumberChk.on("change", this._autoNumberToggle_handler);
    },

    setEdited: function(edited) {
        this.el.find(".uiDocumentNumberField")[edited ? 'addClass' : 'removeClass']("edited");
    },

    _setInvalid: function(invalid) {
        this.el.find(".uiDocumentNumberField")[invalid ? 'addClass' : 'removeClass']("invalid");
    },

    _autoNumberToggle_handler: function() {
        this.setMode(this.autoNumberChk.isChecked() ? "AUTO_NUMBER" : "MANUAL");
    },

    _field_template: function() {
        return ({
            tag: "INPUT",
            id: this.config.name + "_" + this.config.documentId,
            name: this.config.name + "_" + this.config.documentId,
            type: "text",
            maxlength: this.config.maxLength,
            cls: this.baseClass + "-input",
            tabindex: this.config.setTabIndex ? this.shared.tabIndex : null,
            title: this.config.tooltip,
            css: {
                width: isNaN(this.config.width) ? this.config.width : (this.config.width - (acx.browser.ie6 ? 5 : 2) - (this.config.icon === "none" ? 0 : 24)) + "px"
            }
        });
    },

    _main_template: function() {
        return {
            tag: "SPAN", css: { whiteSpace: "nowrap" }, children: this.config.readOnly ? this._readOnly_template() : [this._super(), (this.config.hideAutoNumberChk ? null : this.autoNumberChk.el), this.numberScheme]
        };
    },

    _readOnly_template: function() {
        return {
            tag: "DIV", id: this.id(), css: { margin: "2px" }, text: this.config.value, child: {
                tag: "INPUT", type: "hidden", id: this.config.name + "_" + this.config.documentId, name: this.config.name + "_" + this.config.documentId, value: this.config.value
            }
        };
    },

    setMode: function(mode, retainValue) {
        !mode && (mode = "MANUAL");
        this.el.find(".uiDocumentNumberField")[mode !== "MANUAL" || this.autoNumberChk.isChecked() ? "addClass" : "removeClass"]("disabled");
        mode !== "SCHEME_GENERATED" && this.autoNumberChk.checkbox.prop("checked", mode === "AUTO_NUMBER");
        this.field.prop("disabled", (mode !== "MANUAL" || this.autoNumberChk.isChecked()));
        if (mode !== "MANUAL") {
            this.val(mode === "SCHEME_GENERATED" ? acx.text("Widgets.DocumentNumberField.AutoAssigned") : "");
        } else {
            if (this.numberScheme.val() === "SCHEME_GENERATED" && !retainValue) {
                this.val("");
            }
        }
        this.numberScheme.val(mode);
        this.autoNumberChk.el[mode === "SCHEME_GENERATED" ? "hide" : "show"]();
    },

    validate: function() {
        return this.numberScheme.val() === "MANUAL" && !this.config.readOnly ? this._super() : true;
    }
});

acx.ui.CheckboxField = acx.ui.AbstractField.extend({
    _id: "CheckboxField",
    defaults: {
        disabled:  false,
        label: null,
        tooltip: ""
        // id       (required if using label)
        // name     (required)
        // checked <Boolean>
    },

    init: function(parent) {
        this._super();

        this.checkbox = $.create(this._checkbox_template());
        this.label = this.config.label ? $.create(this._label_template()) : null;

        this.el = $.create(this._main_template());

        if (parent) {
            this.el.appendTo(parent);
        }
        this.checkbox.bind("click", this._fireChangeEvent_handler);
    },

    _fireChangeEvent_handler: function(jEv) {
        this.fire("change", { source: this, jEv: jEv });
    },

    /* Templates */
    _main_template: function() {
        return  { tag: "SPAN", id: this.id(), cls: "uiCheckboxField", title: this.config.tooltip, children: [
            " ", (this.label ? this.label : this.checkbox)
        ]};
    },

    _checkbox_template: function() {
        return { tag: "INPUT", id: this.id() + (this.config.label ? "_chk" : ""), type: "checkbox", name: this.config.name, checked: this.config.checked, disabled: this.config.disabled, tabindex: this.config.setTabIndex ? this.shared.tabIndex : null };
    },

    _label_template: function() {
        return { tag: "LABEL", children: [ this.checkbox, " ", this.config.label ] };
    },

    /* Public Methods */
    check: function(check) {
        this.checkbox.prop("checked", check);
    },

    isChecked: function() {
        return this.checkbox.prop("checked");
    },

    val: function(value) {
        if (value === undefined) {
            return this.isChecked();
        } else {
            this.check(value);
        }
    },

    enable: function() {
        this.checkbox.prop("disabled", false);
    },

    disable: function() {
        this.checkbox.prop("disabled", true);
    },

    labelText: function() {
        return this.config.label;
    }

});

acx.ui.RadioField = acx.ui.AbstractField.extend({
    _id: "RadioField",
    defaults: {
        disabled:  false,
        label: null,
        tooltip: ""
        // id       (required if using label)
        // name     (required)
        // value
    },

    init: function(parent) {
        this._super();

        this._initElements();
        this.el = $.create(this._main_template());
        if (parent) {
            this.el.appendTo(parent);
        }
        this._initEvents();
    },

    _initElements: function() {
        this.radio = $.create(this._radio_field_template());
        this.label = $.create(this._label_template());
    },

    _initEvents: function() {
        this.radio.bind("change", this._change_event_handler);
    },

    /* Event Handlers */
    _change_event_handler: function(jEv) {
        this.fire("change", { source: this, jEv: jEv });
    },

    /* Templates */
    _main_template: function() {
        return { tag: "SPAN", cls: "uiRadioField", id: this.id(), children: [
            this.radio, this.label
        ] };
    },

    _radio_field_template: function() {
        return { tag: "INPUT", id: this.id() + "_radio", type: "radio", name: this.config.name, value: this.config.value };
    },

    _label_template: function() {
        return acx.extend({ tag: "LABEL", text: this.config.label ? " " + this.config.label : "" },
            this.id() ? { "for": this.id() + "_radio"} : {});
    }
});

acx.ui.RatioField = acx.ui.AbstractField.extend({
    _id: "RatioField",
    defaults: {
        value: {},         // object containing from and to attributes
//        showEdited: false
//        name: "",       // (required) the name of the form element that will be submitted
//        value: "",      // initial value of the field
//        require: false  // is a value required when validation performed
        documentId: null     // to support field collection field names. TODO remove this when field name structures are decoupled from backend
    },

    init: function(parent) {
        this._super();

        this.fromField = new acx.ui.NumericField({
            id: this.config.name + "_FROM" + (acx.isNumeric(this.config.documentId) ? "_" + this.config.documentId : ""),
            name: this.config.name + "_FROM" + (acx.isNumeric(this.config.documentId) ? "_" + this.config.documentId : ""),
            size: "mini",
            value: this.config.value.from > 0 ? this.config.value.from : "",
            require: this.config.require,
            maxLength: this.config.maxLength,
            showEdited: this.config.showEdited,
            showInvalid: this.config.showInvalid,
            setTabIndex: this.config.setTabIndex
        });
        this.toField = new acx.ui.NumericField({
            id: this.config.name + "_TO" + (acx.isNumeric(this.config.documentId) ? "_" + this.config.documentId : ""),
            name: this.config.name + "_TO" + (acx.isNumeric(this.config.documentId) ? "_" + this.config.documentId : ""),
            size: "mini",
            value: this.config.value.to > 0 ? this.config.value.to : "",
            require: this.config.require,
            maxLength: this.config.maxLength,
            showEdited: this.config.showEdited,
            showInvalid: this.config.showInvalid,
            setTabIndex: this.config.setTabIndex
        });

        this.el = $.create(this._main_template());

        if (parent) {
            this.el.appendTo(parent);
        }
        this._initEvents();
    },

    _initEvents: function() {
        this.fromField.on("change", this._change_handler);
        this.toField.on("change", this._change_handler);
    },

    setEdited: function(edited) {
        this.fromField.setEdited(edited);
        this.toField.setEdited(edited);
    },

    _change_handler: function(jEv) {
        this.fire("change", { source: this, event: jEv });
    },

    val: function(value) {
        if (value) {
            var isChange = parseInt(value.from, 10) > 0 || parseInt(value.to, 10) > 0;
            this.fromField.val(isChange ? value.from : "");
            this.toField.val(isChange ? value.to : "");
        } else {
            return (this.fromField.val() > 0 || this.toField.val() > 0) && { from: this.fromField.val(), to: this.toField.val() };
        }
    },

    clear: function() {
        this.fromField.val("");
        this.toField.val("");
    },

    validate: function() {
        var from = this.fromField.validate();
        var to = this.toField.validate();
        return (from && to);
    },

    _main_template: function() {
        return {
            tag: "DIV", id: this.id(), cls: "uiRatioField", css: { whiteSpace: "nowrap" }, title: this.config.tooltip, children: [
                this.fromField.el,
                { tag: "SPAN", text: " : " },
                this.toField.el
            ]
        };
    }

});

acx.ui.AccessListPanel = acx.ui.DialogPanel.extend({
    _id: "AccessListPanel",
    defaults: {
        url: "/DocConfidential",
        width: "550px"
        // selectedUserIds
        // documentId
    },
    init: function(parent) {
        this._super(parent);
        this.selectedUserIds = this.config.selectedUserIds;

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    /* Event Handlers */
    commit_handler: function() {
        this.selectedUserIds = $("INPUT[name=lookupUsers]", this.el).map(
            function() {
                return parseInt($(this).val(), 10);
            }).get();
        this._super();
        this.fire("selectusers", { source: this, selectedUserIds: this.selectedUserIds });
    },

    /* Private Methods */
    _show_access_list_content: function() {
        this.setContent($.create(acx.ut.loadingMessage()));
        acx.ajax({
            url: this.config.url,
            data: {
                ACTION: "VIEW_ACCESS_LIST",
                CDOC_ID: this.config.documentId,
                EXISTING_ITEMS: this.selectedUserIds.join(","),
                LOOKUP_ID: "lookupUsers"
            },
            onSuccess: function(resp) {
                this.setContent(resp);
            }.bind(this)
        });
    },

    /* Public Methods */
    setSelectedUserIds: function(selectedUserIds) {
        this.selectedUserIds = selectedUserIds;
    },

    close: function() {
        this._super();
        this.body.empty();
    },

    open: function() {
        this._super();
        this._show_access_list_content();
    }
});

acx.ui.ConfidentialField = acx.ui.AbstractField.extend({
    _id: "ConfidentialField",
    defaults: {
        disabled: false,
        selectedUserIds: [],
        // id
        // name
        // documentId    // TODO: to support current doc upload page
        checked: false,
        persistConfidentialState: false   // save confidential on change via ajax
        // url      // ajax call when clicking "Edit / View Access List"
    },
    init: function(parent) {
        this._super(parent);
        this.enableEditHandler(false);
        this.selectedUserIds = this.config.selectedUserIds;
        this.checkbox = this._checkbox_template();
        this.btnAccessList = this._button_template();

        this.accessListPanel = this.accessListPanel || new acx.ui.AccessListPanel({
            titleKey: "Widgets.ConfidentialField.AccessListPanel.Title",
            url: this.config.url,
            documentId: this.config.documentId,
            selectedUserIds: this.selectedUserIds,
            onselectusers: this._access_list_panel_select_user_handler,
            id: this.id("accessList")
        });

        this.hintEl = $.create(this._hint_template());
        this.el = $.create(this._main_template());
        if (this.config.checked) {
            this._create_selected_user_fields();
        }
        if (parent) {
            this.el.appendTo(parent);
        }
        this.check(this.config.checked);
        this._initEvents();
    },

    _initEvents: function() {
        this.checkbox.on("change", this._checkbox_change_handler);
    },

    /* Event Handlers */
    _checkbox_change_handler: function(jEv) {
        var currVal = this.checkbox.isChecked();
        var msg = (currVal ? acx.text("Widgets.ConfidentialField.MakeConfidential_confirm")
            : acx.text("Widgets.ConfidentialField.MakeNonConfidential_confirm"));

        if (confirm(msg)) {
            if (this.config.persistConfidentialState && parseInt(this.config.documentId, 10) > 0) {
                acx.ajax({
                    url: "/DocConfidential",
                    data: {
                        ACTION: currVal ? "MAKE_CONFIDENTIAL" : "MAKE_NON_CONFIDENTIAL",
                        CDOC_ID: this.config.documentId
                    },
                    onSuccess: this[currVal ? "_make_confidential_handler" : "_make_non_confidential_handler"]
                });
            } else {
                this[currVal ? "_make_confidential_handler" : "_make_non_confidential_handler"]();
            }

            this.check(currVal);
            this.fire("change", { source: this, event: jEv });
        } else {
            this.check(!currVal);
        }
    },

    _make_confidential_handler: function(jEv) {
        this._create_selected_user_fields();
        this.fire("makeConfidential", { source: this, jEv: jEv });
    },

    _make_non_confidential_handler: function(jEv) {
        this._remove_selected_user_hidden_fields();
        this.fire("makeNonConfidential", { source: this, jEv: jEv });
    },

    _access_list_button_click_handler: function() {
        this.accessListPanel.setSelectedUserIds(this.selectedUserIds);
        this.accessListPanel.open();
    },

    _access_list_panel_select_user_handler: function(data) {
        this.selectedUserIds = data.selectedUserIds;
        this._refresh_selected_user_ids();

        if (this.config.persistConfidentialState && this.config.documentId > 0) {
            acx.ajax({
                url: "/DocConfidential",
                data: {
                    ACTION: "SAVE_ACCESS_LIST",
                    CDOC_ID: this.config.documentId,
                    USER_IDS: this.selectedUserIds.join()
                }
            });
        }
        this.fire("change", { source: this });
    },

    /* Private Methods */
    _refresh_selected_user_ids: function() {
        this._remove_selected_user_hidden_fields();
        this._create_selected_user_fields();
    },

    _remove_selected_user_hidden_fields: function() {
        if (this.selectedUsersHiddenFields) {
            this.selectedUsersHiddenFields.remove();
        }
    },

    _create_selected_user_fields: function() {
        this.selectedUsersHiddenFields = $.create(this.selectedUserIds.map(function(userId) {
            return { tag: "INPUT", type: "hidden", name: "userIds_" + this.config.documentId, value: userId };
        }, this)).appendTo(this.el);
    },

    /* Templates */
    _main_template: function() {
        return { tag: "SPAN", cls: "uiConfidential-field", id: this.id(), children: [
            this.checkbox.el,
            this.btnAccessList.el,
            this.hintEl,
            (this.config.disabled && this.config.checked) ? this._hiddenField_template() : null
        ] };
    },

    _hint_template: function() {
        return { tag: "DIV", cls: "hint large", text: acx.text("Widgets.ConfidentialField.ConfidentialPleaseNote") };
    },

    _button_template: function() {
        return new acx.ui.Button({
            id: "btnEditAccessList",
            baseKey: "Widgets.ConfidentialField.EditViewAccessList",
            disabled: this.config.disabled,
            onclick: this._access_list_button_click_handler
        });
    },

    _hiddenField_template: function() {
        return { tag: "INPUT", type: "hidden", name: this.config.name, value: this.config.checked };
    },

    _checkbox_template: function() {
        return new acx.ui.CheckboxField({
            id: this.config.id + "_chk",
            name: this.config.name,
            checked: this.config.checked,
            disabled: this.config.disabled
        });
    },

    /* Public Methods */
    getSelectedUserIds: function() {
        return this.selectedUserIds;
    },

    setSelectedUserIds: function(selectedUserIds) {
        this.selectedUserIds = selectedUserIds;
    },

    isChecked: function() {
        return this.checkbox.isChecked();
    },

    check: function(check) {
        this.btnAccessList.el[check ? "show" : "hide" ]();
        this.hintEl[check ? "show" : "hide" ]();
        this.checkbox.check(check);
    },

    clear: function() {
        this.selectedUserIds = this.config.selectedUserIds;
        this._remove_selected_user_hidden_fields();
    },

    refresh: function() {
        this._refresh_selected_user_ids();
    }
});

acx.ui.NumericField = acx.ui.TextField.extend({
    _id: "NumericField",
    defaults: {
        //     name:           // (required) field name
        //     require: false  // validation command
        //     value: ""       // initial value of the field
        //     tooltip: null   // Tooltip
        //     hintText: "",   // hint text to show when there is no value (when the user has not entered any text)
        //     icon: "none",   // name of an ic_ icon (refer to widgets.css)
        //     width: undefined,     // This is the total width of the widget. Defining "width" will override "size"
        //     size: "medium"        // size of the widget (e.g. "small", "medium" and "large"
        //     maxLength:      // (inherited) the maximum size (in characters) of input
        validationMessageKey: "Widgets.NumericField.ValidationMessage", //key for the invalid input popup
        validationMessageText: null //text for the invalid input popup
        //     showEdited: false
    },

    baseClass: "uiNumericField",

    init: function(parent) {
        this._super(parent);
    },

    val: function(value) {
        if (value === undefined) {
            if (!this.field.val()) {
                return null;
            }
            return acx.isNumeric(this.field.val()) ? parseInt(this.field.val(), 10) : this.field.val();
        } else {
            this._focus_handler();
            this.field.val(value);
            this._edit_handler();
            this._blur_handler();
        }
    },

    _blur_handler: function(jEv) {
        if (acx.isEmpty(this.val())) {
            return;
        }
        this.validate(jEv);
    },

    validate: function(jEv) {
        if ((this.require && acx.isEmpty(this.val())) || !acx.isNumeric(this.val())) {
            this._setInvalid(true);
            this.field.val("");
            if (jEv) {
                alert(acx.ut.textOrKey(this.config.validationMessageText, this.config.validationMessageKey));
            }
            return false;
        } else {
            this._setInvalid(false);
            if (this.lastChange !== this.field.val()) {
                this.fire("change", this, { lastVal: this.lastChange, jEv: jEv });
                this.lastChange = this.field.val();
            }
            return true;
        }
    }
});

acx.ui.FileField = acx.ui.AbstractField.extend({
    _id: "FileField",
    defaults: {
        disabled: false,
        fileAccessReason: 3, //Default to ControlledDoc
        documentId: null
        // showEdited: false
        // name: ""       (required) field name
        // tooltip: ""      Tooltip
        // require: null
    },

    init: function(parent) {
        this._super();

        this.field = $.create(this._field_template());
        this.el = $.create(this._main_template());
        if (parent) {
            this.el.appendTo(parent);
        }

        this.lastVal = this.val();
        this._initEvents();
    },

    _initEvents: function() {
        this.field
            .bind("focus", this._focus_handler)
            .bind("blur", this._blur_handler);
    },

    /* Event Handlers */
    _focus_handler: function(jEv) {
        this.fire("focus", { source: this, jEv: jEv });
    },

    _blur_handler: function(jEv) {
        this.fire("blur", { source: this, jEv: jEv });
        if (this.lastVal !== this.val()) {
            this.fire("change", { source: this, lastVal: this.lastVal, jEv: jEv });
            this.lastVal = this.val();
        }
    },

    _fileDownload_handler: function(jEv) {
        if(this.config.value.fileFrozen){
            window.frozenFileInfoModal = new acx.ui.InfoPanel({
                id: "frozenFileInfoModal",
                titleKey: "Widgets.FileField.FileFrozenModalTitle",
                baseClass: "alertPanel",
                width: 400,
                open: true,
                body: acx.text("Widgets.FileField.FileFrozenModalContent")
            });
        }
        else if (this.config.disabled || parseInt(this.config.documentId, 10) === 0) {
            return false;
        } else {
            if (!this.iframe) {
                this.iframe = $.create({ tag: "IFRAME", src: "about:blank", css: { display: "none" } }).appendTo(this.el);
            }

            var documentIdParam = "";
            this.config.documentId && (documentIdParam = "&ControlledDocument_ID=" + this.config.documentId);

            this.iframe.attr("src", "/Correspondence?ACTION=0" +
                "&PermanentFile_ID=" + this.config.value.fileId +
                "&REASON=" + this.config.fileAccessReason +
                documentIdParam);
        }
    },

    _setEdited_handler: function() {
        this.field.addClass("edited").removeClass("invalid");
    },

    _setInvalid: function(invalid) {
        this.field[invalid ? 'addClass' : 'removeClass']("invalid");
    },

    _isEmpty: function() {
        return (this.val() === "") && !(this.config.value && acx.isNumeric(this.config.value.fileId) && this.config.value.fileId > 0);
    },

    /* Templates */
    _main_template: function() {
        return { tag: "SPAN", cls: "uiFileField", children: (this.config.value && acx.isNumeric(this.config.value.fileId) && this.config.value.fileId > 0) ? this._fileIcon_template() : this.field };
    },

    _fileIcon_template: function() {
        return [
            acx.ut.fileImage({
                fileType: this.config.value.fileType,
                clickable: !(this.config.disabled || parseInt(this.config.documentId, 10) === 0),
                onclick: (this.config.disabled || parseInt(this.config.documentId, 10) === 0 ? null : this._fileDownload_handler)
            }),
            { tag: "DIV", cls: "fileName", text: this.config.value.fileName + " [" + this.config.value.fileSize + "]" },
            { tag: "DIV", cls: "fileReplaceWith", text: acx.text("Widgets.FileField.ReplaceWith") + ": ", child: this.field }
        ];
    },

    _field_template: function() {
        return {
            tag: "INPUT",
            type: "file",
            name: this.config.name,
            id: this.id(),
            title: this.config.tooltip,
            disabled: this.config.disabled,
            size: "42",
            cls: "uiFileField " + (this.config.require ? " isRequired " : "")
        };
    }
});

acx.ui.SelectListField = acx.ui.AbstractField.extend({
    _id: "SelectListField",
    defaults: {
        items: [],        // Array of item objects containing name, value, selected attributes to populate list
        hintText: acx.text("Widgets.Generics.Select"),    // Creates a placeholder first option in the select list, set to null for no hint text
        tooltip: null,
        size: "medium",
        disable: false,
        showHintText: true,
        valueKey: "value"   // object key name for pulling value out of object passed to val function
        //showEdited: false
        //name: "",       (required) the name of the form element that will be submitted
        //value: "",      initial value of the field
        //require: false  is a value required when validation performed
    },

    init: function(parent) {
        this._super();

        this.el = $.create(this._main_template());

        this.config.value && this.el.val(this.config.value);

        this._initEvents();

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    val: function(value, suppressChange) {
        if (value === undefined) {
            return this.el.val();
        } else {
            var val = acx.isObject(value) && value[this.config.valueKey] ? value[this.config.valueKey] : value;
            this.el.val(val);
            if (val !== undefined && !suppressChange) {
                this._change_handler();
            }
        }
    },

	getSelectedItem: function() {
		var self = this;
		var filterd = this.config.items.filter(function(item) {
			return item.value === self.val();
		});
		return filterd.length && filterd[0];
	},

    enable: function() {
        this.el.removeClass("disabled").prop("disabled", false);
        return this;
    },

    disable: function() {
        this.el.addClass("disabled").prop("disabled", true);
        return this;
    },

    isDisabled: function() {
        return this.el.hasClass("disabled");
    },

    addItems: function(items) {
        var optionItems = [].concat(items).map(this._item_template_handler);
        this.el.append($.create(optionItems));
        return this;
    },

    getItems: function() {
		var items = [];
        this.el.find("OPTION:gt(0)").each(function(i, o) {
			items.push({value: $(o).attr("value"), displayText: $(o).text()});
		});
        return items;
    },

    removeAll: function() {
        this.el.empty();
        this.config.hintText !== null && this.config.showHintText && this.el.append($.create({ tag: "OPTION", text: "-- " + this.config.hintText + " --", value: "" }));
        return this;
    },

    removeAt: function(index) {
        $("OPTION:eq(" + index + ")", this.el).remove();
        return this;
    },

    setHintText: function(text) {
        $("OPTION:first", this.el).text("-- " + text + " --");
        return this;
    },

    _change_handler: function(jEv) {
        this.fire("change", this, { jEv: jEv });
    },

    _initEvents: function() {
        this.el
            .bind("change", this._change_handler)
            .bind("keypress", this._enterCapture_handler);
    },

    _enterCapture_handler: function(jEv) {
        if (jEv.which === 13) {
            jEv.preventDefault();
            this.fire("enterPress", this, { jEv: jEv });
        }
    },

    _option_group_template: function(item) {
        var optionItems = item.items.map(this._item_template_handler);
        return {
            tag: "OPTGROUP",
            label: (item.name === undefined ? item.displayText : item.name),
            children: optionItems
        };
    },

    _item_template_handler: function(item) {
        if ("items" in item) {
            return this._option_group_template(item);
        }
        return this._options_template(item);
    },

    _options_template: function(option) {
        return {
            tag: "OPTION",
            text: (option.name === undefined ? (option.displayText === undefined ? option.value : option.displayText) : option.name),
            value: option.value,
            selected: option.selected,
            data: option.data
        };
    },

    _main_template: function() {
        var hintItem = [];
        if (this.config.hintText !== null && this.config.showHintText) {
            hintItem.push({ tag: "OPTION", text: "-- " + this.config.hintText + " --", value: "" });
        }
        return { tag: "SELECT", id: this.id(), name: this.config.name, title: this.config.tooltip ? this.config.tooltip : "",
            tabindex: this.config.setTabIndex ? this.shared.tabIndex : null,
            cls: "uiSelectListField " + (this.config.require ? " isRequired " : "") + (this.config.size ? this.config.size : "") + (this.config.disable ? " disabled" : ""),
            disabled: this.config.disable,
            children: hintItem.concat(this.config.items.map(this._item_template_handler)) };
    }
});

acx.ui.YesNoSelectListField = acx.ui.SelectListField.extend({
    _id: "YesNoSelectListField",
    defaults: {
        size: " ",
        items: [
            { name: acx.text("Widgets.Generics.Yes"), value: true },
            { name: acx.text("Widgets.Generics.No"), value: false }
        ]
    }
});

acx.ui.MultiSelectListField = acx.ui.SelectListField.extend({
    _id: "MultiSelectListField",
    defaults: {
        // id: null
        // name: null
        // require: false
        // disable: false
        // items: []
        // showHintText: true
        size: "large",
        tooltip: "",
        hintText: ""
    },

    init: function(parent) {
        this._super(parent);
        this._initEvents();
    },

    _initEvents: function() {
        this.el.bind("dblclick", this._dbl_click_handler);
    },

    /* Event Handlers */
    _dbl_click_handler: function(jEv) {
        this.fire("dblclick", { source: this, jEv: jEv });
    },

    /* Templates */
    _main_template: function() {
        return $.extend({}, this._super(), {
            size: 15,
            cls: "uiMultiSelectListField " + (this.config.require ? " isRequired " : "") + (this.config.size ? this.config.size : "") + (this.config.disable ? " disabled" : "")
        });
    }
});

acx.ui.AbstractMultiSelectField = acx.ui.AbstractField.extend({
    _id: "AbstractMultiSelectField",
    defaults: {
        tooltipKey: null,
        tooltipText: null,
        hintKey: null,
        hintText: null,
        disable: false,
        size: "medium"
        //    showEdited: false
        //    require: false     // inherited from AbstractField
    },

    init: function(parent) {
        this._super();

        this._initElements();
        this._initEvents();
    },

    _initElements: function() {
        this.hint = acx.ut.textOrKey(this.config.hintText, this.config.hintKey);
        this.selectedItemsDisplay = $.create(this._selectedItemsDisplay_template());
        this.el = $.create(this._main_template());
        this.el.attr("title", acx.ut.textOrKey(this.config.tooltipText, this.config.tooltipKey));
    },

    _initEvents: function() {
        if (!this.config.disable) {
            this.el.on("click", this._openPanel_handler);
        }

        this.el.on('keypress', this._enterCapture_handler);
    },

    _enterCapture_handler: function(jEv) {
        var key = jEv.which, ENTER = 13, SPACE = 32;

        if (key === ENTER) {
            jEv.preventDefault();
            this.fire("enterPress", this, { jEv: jEv });
        } else if (key === SPACE) {
            jEv.preventDefault();
            this.el.blur();
            this._openPanel_handler();
        }
    },

    _openPanel_handler: function(jEv) {
        this.fire("clickMultiSelect", jEv, this);
    },

    // view code ( templates )
    _selectedItemsDisplay_template: function() {
        return { tag: "SPAN", cls: "uiMultiSelectField-selectedText " + (!acx.isEmpty(this.hint) ? "hint" : ""), text: this.hint  };
    },

    _main_template: function() {
        return {
            tag: "DIV", tabindex: 0, cls: "uiMultiSelectField uiField uiIconField " + this.config.size + (this.config.require ? " isRequired" : "") + (this.config.disable ? " disabled" : ""),
            id: this.config.id, children: [
                { tag: "DIV", cls: "bicon ic-multiselect" },
                this.selectedItemsDisplay,
                { tag: "SPAN", cls: "uiMultiSelectField-values" }
            ]};
    }
});

acx.ui.DummyMultiSelectField = acx.ui.AbstractMultiSelectField.extend({
    _selectedItemsDisplay_template: function() {
        return { tag: "SPAN", cls: "uiMultiSelectField-selectedText", text: this.config.value.join(", ") };
    }
});

acx.ui.MultiSelectField = acx.ui.AbstractMultiSelectField.extend({
    _id: "MultiSelectField",
    defaults: {
        items: null,          // list of bidi items
        itemTypeKey: null,
        itemTypeText: null,
        enableFilter: true
//      tooltipKey: null
//      tooltipText: null
//      hintKey: null
//      hintText: null
//      disable: false
//      showEdited: false
//      require: false     // inherited from AbstractField
    },

    init: function(parent) {
        this._super();
        this.saveData = [];
        this._makeBidi();
        this._makePanel();
        this._setState();
        this.on("clickMultiSelect", this._openPanel_handler);
        if (parent) {
            this.el.appendTo(parent);
        }
    },

    // interface ( public methods )
    val: function(values) {
        if (values === undefined) {
            return this.bidi.getSelectedValues();
        } else {
            this.bidi.setSelectedValues(values);
            this._setState();
        }
    },

    setItems: function(values) {
        var oldValues = this.bidi.getSelectedValues();
        this.bidi.setItems(values);
        this.bidi.setSelectedValues(oldValues);
        this._setState();
    },

    // model code
    _makeBidi: function(items) {
        this.bidi = new acx.ui.Bidi({
            id: this.config.id ? this.config.id + "_bidi" : "",
            itemTypeKey: this.config.itemTypeKey,
            leftTitleText: this.config.leftTitleText,
            rightTitleText: this.config.rightTitleText,
            items: items || this.config.items || [],
            width: 756,
            listSize: 12,
            enableFilter: this.config.enableFilter,
            required: this.config.require
        });
    },

    _makePanel: function() {
        this.panel = new acx.ui.DialogPanel({
            id: this.config.id ? this.config.id + "_panel" : "",
            titleText: this.config.itemTypeText,
            titleKey: this.config.itemTypeKey,
            body: this.bidi,
            width: 767,
            commitBtnConfig: { primary: true },
            onCommit: this._commitPanel_handler,
            onCancel: this._cancelPanel_handler,
            onClose: this._closePanel_handler
        });
    },

    // controller code ( event handlers )
    _commitPanel_handler: function(jEv) {
        this._setState();
        this.fire("change", this);
    },

    _cancelPanel_handler: function(jEv) {
        this.bidi.setSelectedValues(this.saveData);
    },

    _openPanel_handler: function(jEv) {
        this.saveData = this.val();
        this.panel.open(jEv);
    },

    _closePanel_handler: function() {
        this.bidi.filter && this.bidi.filter.val("");
    },

    _setState: function() {
        var selectedValues = this.bidi.getSelectedText().join(", ");
        this.selectedItemsDisplay.text(selectedValues || this.hint);
        if (!acx.isEmpty(this.hint)) {
            this.selectedItemsDisplay.toggleClass("hint", acx.isEmpty(selectedValues));
        }
        this.el.find(".uiMultiSelectField-values").html($.create(this.val().map(function(v) {
            return { tag: "INPUT", type: "hidden", name: this.config.name, value: v };
        }, this)));
    },

    _setEdited_handler: function(jEv) {
        if (this.saveData.join() !== this.val().join()) {
            this._super();
        }
    }

});

acx.ui.VersionListBidi = acx.ui.Bidi.extend({
    _id: "VersionListBidi",
    defaults: {
        //     listSize: 8,        // (inherited) number of items in the select boxes
        //     width: 600,         // (inherited) width of the widget in pixels
        //     required: false     // (inherited) shows the required *
        //     leftTitleText:      // the title of the left list
        //     rightTitleText:     // the title of the right list
        //     itemTypeKey:        // the type of thing in the list key value (inherited from MultiSelectField)
        //     itemTypeText:       // the type of thing in the list text value (inherited from MultiSelectField)
        //     listName:           // (required) must match an enum from VersionList.java
        //     listProperty:       // (required) eg PRIMARY_ATTRIBUTE
        //     listVersion         // (required) latest version of the list (for caching purposes)
        //     projectId:          // (required) current project id
        selected: [],       // array of selected values
        autoLoad: true      // should we start loading the VersionList data as soon as the bidi is created?
    },

    init: function(parent) {
        // DO NOT call the bidi init function yet.
        // initially we just create a loading message.
        this.el = $.create(acx.ut.loadingMessage());
        this.el.height((17 + 12 * this.config.listSize) + "px");
        if (parent) {
            this.el.appendTo(parent);
        }
        if (this.config.autoLoad) {
            this.initBidi();
        }
    },

    // interface ( public methods )
    getSelectedValues: function() {
        return this.config.selected;
    },

    getSelectedText: function() {
        return this.getSelectedValues();
    },

    setSelectedValues: function(values) {
        this.config.selected = values;
    },

    initBidi: function() {
        acx.ajax({
            url: this.config.resourceURL ? this.config.resourceURL : "/VersionList?_action=getLatestContents",
            viewName: "jsonView",
            type: "GET",
            data: {
                projectId: this.config.projectId,
                versionList: this.config.listName,
                propertyName: this.config.listProperty,
                listVersion : this.config.listVersion
            },
            onSuccess: this._loadData_handler.bind(this)
        });
    },

    _loadData_handler: function(result) {
        this.config.items = result.versionList.map(function(value) {
            return { text: value, value: value, selected: this.config.selected.contains(value) };
        }, this);
        var loadingDiv = this.el;
        this._proto().init.call(this); // the bidi widget init function
        loadingDiv.replaceWith(this.el);
        this.getSelectedValues = this._proto().getSelectedValues; // and override interface methods to point to bidi
        this.setSelectedValues = this._proto().setSelectedValues;
    }
});

acx.ui.VersionListField = acx.ui.MultiSelectField.extend({
    _id: "VersionListField",
    defaults: {
        //     listName:       // (required) must match an enum from VersionList.java
        //     listProperty:   // (required) eg PRIMARY_ATTRIBUTE
        //     listVersion     // (required) latest version of the list (for caching purposes)
        //     projectId:      // (required) current project id
        //     name:           // (required) form field name (inherited from AbstractField)
        //     itemTypeKey:    // (required) (inherited from MultiSelectField)
        selected: [],   // array of selected values
        autoLoad: false // automatically load VersionList data when field created
    },

    _makeBidi: function(items) {
        this.bidi = new acx.ui.VersionListBidi({
            id: this.config.id ? this.config.id + "_bidi" : "",
            itemTypeKey: this.config.itemTypeKey,
            itemTypeText: this.config.itemTypeText,
            leftTitleText: this.config.leftTitleText,
            rightTitleText: this.config.rightTitleText,
            width: 756,
            listSize: 12,
            required: this.config.require,
            listName: this.config.listName,
            listProperty: this.config.listProperty,
            listVersion: this.config.listVersion,
            projectId: this.config.projectId,
            selected: this.config.selected,
            autoLoad: this.config.autoLoad
        });
        this.bidiLoaded = this.config.autoLoad;
    },

    _openPanel_handler: function(jEv) {
        if (! this.bidiLoaded) {
            this.bidi.initBidi();
            this.bidiLoaded = true;
        }
        this._super(jEv);
    },

    setItems: function(values) {
        if (this.bidiLoaded) {
            this._super(values);
        } else {
            var oldSelected = this.val();
            var newSelected = [];
            values.forEach(function(item) {
                if (oldSelected.contains(item.value)) {
                    newSelected.push(item.value);
                }
            });
            this.bidi.setSelectedValues(newSelected);
            this._setState();
        }
    }
});

//TODO: Move to acx.doc namespace
acx.ui.DocVersionListField = acx.ui.VersionListField.extend({
    init: function(parent) {
        this.validator = $.create({
            tag: "INPUT",
            cls: (this.config.require ? "isRequired" : ""),
            type: "hidden",
            name: this.config.name + "_listValidator"
        });
        this._super(parent);
        this.el.append(this.validator);
    },

    _setState: function() {
        this.validator.val(this.val().length ? "1" : "");
        this._super();
    }

});

acx.ui.Calendar = acx.ui.Widget.extend({
    _id: "Calendar",
    defaults: {
        displayField: "",
        flatContainer: "",
        date: null
    },

    baseCalendarConfig : {
        animation: false,
        dateFormat: (top.mainMenu ? top.mainMenu.getDateFormat() : false) || window.localeDateFormat || "%d/%m/%Y",
        align: "Br"
    },

    select_handler: function(cal) {
        this.fire("select", cal.selection.get(), cal);
    },

    init: function(parent) {
        this._super();

        this.calConfig = acx.extend({}, this.baseCalendarConfig,
            (function(widget) {
                return {
                    onSelect: function() {
                        widget.select_handler(this);
                } };
            })(this),
            {
                inputField: this.config.displayField,
                cont: this.config.flatContainer
            },
            ( !acx.isEmpty(this.config.date) ?
                {
                    date: window.JSCal.dateToInt(this.config.date),
                    selection: window.JSCal.dateToInt(this.config.date)
                } :
                {}
            )
        );

        this.el = $(new window.JSCal(this.calConfig));
    }
});

acx.ui.DateField = acx.ui.TextField.extend({
    _id: "DateField",
    defaults: {
        allowToday: true,
        allowPastDate: true,
        value: "",
        icon: "calendar",
        size: "small"
        //  showEdited: false
        //  require: false     // inherited from AbstractField
    },
    baseClass: "uiDateField",
    date: null,

    init: function(parent) {
        this.hiddenField = $.create({ tag: "INPUT",
            type: "hidden",
            name: this.config.id,
            id: this.config.id,
            cls: this.config.require ? "isRequired" : "" });
        this._super(parent);

        this.displayField = this.field;
        this.calendarButton = this.el.find(".ic-calendar");

        if (this.config.value) {
            this.displayField.val(""); //to override acx.ui.TextField init super
            this.initialDate = acx.parseDate(this.config.value) || acx.parseDate(this.config.value, "%Y-%m-%d");
            this.date = this.initialDate;

            this.hiddenField.val(this._formatHiddenFieldFromDate());
            this.displayField.val(this._formatDisplayFieldFromDate());

            this.initialDate = this._isDateValid(this.initialDate) ? this.initialDate : null;
        }

        this.calendar = new acx.ui.Calendar(this._generateCalendarConfig());
        this.calendarObj = this.calendar.el[0];

        this.initEvents();
    },

    _generateCalendarConfig: function() {
        var calConfig = {
            displayField: this.displayField.attr("id"),
            onSelect: this._calendar_callback_handler
        };

        if (!acx.isEmpty(this.date)) {
            calConfig["date"] = this.date;
        }

        return calConfig;
    },

    initEvents: function() {
        this.on("iconClick", function() {
            this.calendarObj.popup(this.calendarButton[0]);
            return false;
        }.bind(this));

        this.displayField.bind("blur", function() {
            this.setDate(this.displayField.val());
            this.fire('dateUpdated');
        }.bind(this));
    },

    _formatHiddenFieldFromDate: function() {
        return acx.isEmpty(this.date) ? "" : acx.formatDate(this.date, "%Y-%m-%d");
    },

    _formatDisplayFieldFromDate: function() {
        return acx.isEmpty(this.date) ? "" : acx.formatDate(this.date);
    },

    _setDate:function (date) {
        if (acx.isDate(date) || acx.isEmpty(date)) {
            this.date = date;
        } else {
            this.date = acx.parseDate(date) || acx.parseDate(acx.formatDate(date)) || null;
        }
    },

    validate: function() {
        if (!this._isDateValid()) {
            this.clear();
        }
        // TODO copied from AbstractField.validate()
        if (!this.require || !this._isEmpty()) {
            this._setInvalid(false);
            return true;
        } else {
            this._setInvalid(true);
            return false;
        }
    },

    val: function(date) {
        if (date === undefined) {
            return this.hiddenField.val();
        } else {
            this._setDate(date);
            if (this.validate()) {
                this.hiddenField.val(this._formatHiddenFieldFromDate());
                this._super(this._formatDisplayFieldFromDate());
            }
        }
    },

    _isEmpty: function() {
        return acx.isEmpty(this.date);
    },

    getFormattedDate: function() {
        return this.displayField.val();
    },

    _isPastDate: function(date) {
        return date ? (acx.formatDate(date, "%Y-%m-%d") < acx.formatDate(new Date(), "%Y-%m-%d")) : false;
    },

    _isToday: function(date) {
        return date ? (acx.formatDate(date, "%Y-%m-%d") === acx.formatDate(new Date(), "%Y-%m-%d")) : false;
    },

    _isDateValid: function (date) {
        return (this.config.allowToday || !this._isToday(date || this.date)) && (this.config.allowPastDate || !this._isPastDate(date || this.date));
    },

    _calendar_callback_handler: function(jsCalDate, calWidget) {
        if (acx.isEmpty(jsCalDate)) {
            return false;
        } else {
            this.date = this.resetTime(window.JSCal.intToDate(jsCalDate));
        }

        calWidget.hide();
        if (this._isDateValid()) {
            this.val(this.date);
        } else {
            this.clearOrReset();
            alert(acx.text("Widgets.DateField.EnterFutureDate"));
        }
        this.fire('dateUpdated');
    },

    resetTime: function(date) {
        date.setHours(12);
        date.setMinutes(0);
        return date;
    },

    setDate: function(date, noValidation) {
        if (acx.isEmpty(date)) {
            this.clear();
            return false;
        }

        this.date = acx.isDate(date) ? date : acx.parseDate(date);
        if (! this.date && !noValidation) {
            alert(acx.text("Widgets.DateField.InvalidDate", date));
            this.clearOrReset();
            return false;
        }
        this.calendarObj.selection.set(window.JSCal.dateToInt(this.date));
    },

    clearOrReset: function() {
        if (acx.isDate(this.initialDate)) {
            this.setDate(this.initialDate, true);
        } else {
            this.clear();
        }
    },

    clear: function() {
        this.calendarObj.selection.clear();
        this.date = null;
        this.displayField.val("");
        this.hiddenField.val("");
    },

    _field_template: function() {
        return acx.extend(this._super(), { id: this.config.id + "_da", name : this.config.id + "_da" });
    },

    _main_template: function() {
        var tmp = this._super();
        tmp.id = this.id("dateField");
        tmp.child.push(this.hiddenField);
        return tmp;
    }
});


acx.ui.HtmlEditorField = acx.ui.TextAreaField.extend({
    _id: "HtmlEditorField",
    defaults: {
        //     name:          // (required) field name
        //     showEdited: false
        height: 400,   // the height of the widget
        width: 300,    // the width of the widget
        richText: true,
        language: "en-au"
    },

    init: function(parent) {
        this._super(parent);
        this.isRichText = this.config.richText;
        this.hasBeenFocused = false;

        if (this.isRichText) {
            this._createHtmlEditor();
        }
    },

    _initEvents: function() {
    },

    _createHtmlEditor: function() {
        var CKEDITOR = window.CKEDITOR;
        if (CKEDITOR && CKEDITOR.instances[this.config.name]) {
            CKEDITOR.remove(CKEDITOR.instances[this.config.name]);
        }

        var contentsCss = [];

        // in the iframe that is created by ckeditor we inject our own styles
        // so that wysiwyg stands
        if (window.baseHref) {
          contentsCss = [
            'common/styles.css',
            'ckeditor4/contents.css',
            'mail/directives/richTextField/richTextField-override.css'
          ].map(function(r) {
            return window.baseHref + r; 
          });
        }

        this.editor = CKEDITOR.replace(this.field[0], {
                on: { 
                  instanceReady: this._richTextReady_handler,
                  pluginsLoaded: this._pluginsLoaded_handler
                },
                height: this.config.height - 37,
                width: this.config.width,
                language: this.config.language,
                toolbar: [
                  ['Font','FontSize','Bold','Italic','Underline'],
                  ['TextColor','BGColor'],
                  ['NumberedList','BulletedList'],
                  ['Outdent','Indent'],
                  ['Table'],
                  ['GroupedPaste'],
                  ['TextAlign'],
                  ['MoreButtons']
                ],
                allowedContent: true,
                customConfig: '',
                contentsCss: contentsCss,
                stylesSet: [],
                font_defaultLabel: 'Verdana',
                fontSize_defaultLabel: '12',
                pasteFromWordPromptCleanup: true,
                pasteFromWordRemoveStyles: false,
                pasteFromWordRemoveFontStyles: false,
                disableNativeSpellChecker: false
            }
        );
    },

    addUiMenuItems: function(editor, group, toolbarName, label, icon, items){
      var _items = {};
      editor.addMenuGroup(group);

      items.forEach(function(item, index){
        item.order = index;
        item.group = group;
        _items[item.command] = item;
      });

      editor.addMenuItems(_items);

      editor.ui.add(toolbarName, window.CKEDITOR.UI_MENUBUTTON, {
        label: label,
        // Disable in source mode.
        modes: { 
          wysiwyg: 1 
        },
        icon: icon,
        onMenu: function() {
          var active = {};

          for (var p in _items) {
            active[p] = editor.getCommand(_items[p].command).state;
          }

          return active;
        }
      });  
    },

    addPasteButtons: function (editor) {
      this.addUiMenuItems(editor, 'grouped_paste', 'GroupedPaste', 'Paste', 'Paste', [
        {
          label: editor.lang.clipboard.paste,
          command: 'paste'
        },

        {
          label: editor.lang.pastetext.title,
          command: 'pastetext'
        },

        {
          label: editor.lang.pastefromword.title,
          command: 'pastefromword'
        }
      ]);
    },

    addMoreButtons: function(editor) {
      this.addUiMenuItems(editor, 'more_buttons', 'MoreButtons', editor.lang.quicktable.more, '', [
        {
          label: editor.lang.basicstyles.subscript,
          command: 'subscript',
        },
        {
          label: editor.lang.basicstyles.superscript,
          command: 'superscript',
        },
        {
          label: editor.lang.specialchar.title,
          command: 'specialchar',
        },
        {
          label: editor.lang.link.title,
          command: 'link',
        },
        {
          label: editor.lang.link.unlink,
          command: 'unlink',
        },
        {
          label: editor.lang.horizontalrule.toolbar,
          command: 'horizontalrule',
        }
      ]);
    },

    addJustifyButtons: function(editor) {
        this.addUiMenuItems(editor, 'grouped_justification', 'TextAlign', 'Text aling', 'JustifyLeft', [
          {
            label: editor.lang.justify.left,
            command: 'justifyleft',
          },

          {
            label: editor.lang.justify.center,
            command: 'justifycenter',
          },

          {
            label: editor.lang.justify.right,
            command: 'justifyright',
          }
        ]);
    },


    _pluginsLoaded_handler: function(event) {
      this.addPasteButtons(event.editor);
      this.addJustifyButtons(event.editor);
      this.addMoreButtons(event.editor);
    },

    _richTextReady_handler: function(editorInstance) {
        this.editorInstance = editorInstance.editor;
        this.editorInstance.on('focus', function() {
            this.hasBeenFocused = true;
        }.bind(this));

        // This is a temporary solution until the following is fixed/released
        // http://dev.ckeditor.com/ticket/13883 
        if (this.editorInstance.pasteFilter){
          this.editorInstance.pasteFilter.allow('table[*]{*}(*);tr[*]{*}(*);th[*]{*}(*);td[*]{*}(*);');
        }


        this.fire("richTextReady", this, this.editorInstance);
    },

    insertHtml: function(html) {
        // Fix for Firefox bug where 'insertHtml' appends instead of prepending if editor hasn't been focused yet :(
        if (this.hasBeenFocused) {
            this.editorInstance.insertHtml(html);
        } else {
            this.prependHtml(html);
        }
    },

    prependHtml: function(html) {
        var oldValue = this.val();
        this.val(html + "<p></p><p></p>" + oldValue);
    },

    appendHtml: function(html) {
        var oldValue = this.val();
        this.val(oldValue + "<p></p><p></p>" + html);
    },

    val: function(value) {
        if (!this.isRichText) {
            return this._super(value);
        }
        if (acx.isEmpty(value)) {
            return this.editor.getData();
        } else {
            this.editor.setData(value);
        }
    },

    _main_template: function() {
        var ret = this._super();
        if (this.config.richText) {
            ret.cls = "richTextField";
            delete ret.css.height;
        }
        return ret;
    }
});

acx.ui.RowActionMenu = acx.ui.Menu.extend({
    _id: "RowActionMenu",

    baseClass: "uiMenu rowActionMenu",

    _getLocation: function(target, jEv) {
        return acx.vector({ y: target.vOffset().addY(target.outerHeight()).y, x: jEv.vMouse().x }).asOffset();
    }
});

// RowActions listens for clicks inside an element then shows a RowActionMenu on the row that was clicked
// usage: new acx.ux.RowActions("#mytable", { menu: new acx.ui.RowActionMenu({ items: [ ... ] }) });
acx.ux.RowActions = acx.ux.Observable.extend({
    _id: "RowActions",
    defaults: {
        globalizeMProps: false,             // put mProps into the global scope (workaround for old style menu functions
        selector: "TR.dataRow",             // selector to find the actionable row
        except: "A,INPUT,.fileIcon,.ficon", // unless you have clicked on one of these
        menu: null                          // (required) an instance of acx.ui.RowActionMenu
    },

    init: function(parent) {
        this._super();
        if (parent) {
            $(parent).bind("click", this.openMenu.bind(this));
        }
        this.activeRow = null;
    },

    openMenu: function(jEv) {
        var row = $(jEv.target).closest(this.config.selector);
        if (!row.length || $(jEv.target).closest(this.config.except).length) {
            return;
        }
        if (row.hasClass("active")) {
            row.removeClass("active");
            this.config.menu.hide_handler();
            this.activeRow = null;
        } else {
            row.addClass("active");
            this.config.menu.show(row, this._getMProps(row), jEv);
            if (this.activeRow) {
                this.activeRow.removeClass("active");
            }
            this.activeRow = row;
        }
    },

    _getMProps: function(jEl) {
        var mProps = jEl.data("uimenu-props") || this._parseMPropsJson(jEl);

        if (this.config.globalizeMProps) {
            window.mProps = mProps;
        }
        return mProps;
    },

    _parseMPropsJson: function(jEl) {
        var jsonData = jEl.attr("data-uimenu-props-json");
        return typeof jsonData !== 'undefined' ?
            $.parseJSON(jsonData.replace(/'/g, '"')) :
            undefined;
    }
});

acx.ui.Accordion = acx.ui.Widget.extend({
    _id: "Accordion",
    defaults: {
        header: "",              // Header Object
        body: "",                // Body Object
        expanded: true           // Expanded state
    },
    init: function(parent) {
        this._super();
        this.expanded = this.config.expanded;
        this._renderUI(parent);
    },

    /* Templates - START */
    _main_template: function() {
        return ({
            tag: "DIV", cls: "accordion",
            children: [ this.headerEl, this.bodyEl ]
        });
    },

    _header_content_template: function() {
        return {
            tag: "DIV", cls: "accordion-header-content",
            child: this.config.header,
            onclick: this._accordionHeaderClick_handler
        };
    },

    _header_template: function() {
        return {
            tag: "DIV", cls: "accordion-header",
            child: this.headerContentEl
        };
    },

    _body_template: function() {
        return { tag: "DIV", cls: "accordion-body", css: { height: 0 }, child: this.config.body };
    },
    /* Templates - END */


    /* Event Handlers - START */
    _accordionHeaderClick_handler: function(event) {
        this.expanded = !this.expanded;
        this.expand(this.expanded);
    },
    /* Event Handlers - END */

    /* Private Methods - START */
    _renderUI: function(parent) {
        this._initElements();
        if (parent) {
            this.appendTo(parent);
        }
        this.expand(this.expanded);
    },

    _initElements: function() {
        this.headerContentEl = $.create(this._header_content_template());
        this.headerEl = $.create(this._header_template());
        this.bodyEl = $.create(this._body_template());
        this.el = $.create(this._main_template());
    },
    /* Private Methods - END */

    /* Public Methods - START */
    expand: function(expand) {
        var content = this.bodyEl.children();
        this.headerContentEl.toggleClass("accordion-collapse", !expand);
        if (expand) {
            content.show();
            var height = content.outerHeight();
            if (height > 0) {
                this.bodyEl.animate({ height : height});
            } else {
                this.bodyEl.css("height", "auto");
            }
        } else {
            this.bodyEl.animate({ height : 0 }, { complete: function() {
                if (!this.expanded) {
                    content.hide();
                }
            }.bind(this) });
        }
        this.fire(expand ? "expand" : "collapse", this);
    },

    setHeaderContent: function(header) {
        this.headerContentEl.html(header);
    }
    /* Public Methods - END */
});

acx.ui.MessageBar = acx.ui.Widget.extend({
    _id: "MessageBar",
    defaults : {
        showCloseBtn: false,
        animationDuration: 400
    },

    init: function(parent) {
        this._super();
        this.el = $.create(this._messageBar_template());
        this._initEvents(); // As right now, _initEvents only adds handler for close icon
        if (parent) {
            this.el.appendTo(parent);
        }
    },

    _initEvents: function() {
        var that = this;
        this.config.showCloseBtn && this.el.on('click', 'li', function(jEvt) {
            var $this = $(this), $target = $(jEvt.target);
            if ($target.hasClass('close')) {
                $this.slideUp(that.config.animationDuration, function() {
                    $this.remove();
                });
            }
        });
    },

    empty: function() {
        this.el.empty();
        return this;
    },

    add: function(type, message) {
        this.el.append($.create(this._message_template(type, message)));
        return this;
    },

    _messageBar_template: function() {
        return { tag: "UL", id: this.id(), cls: "messagePanel" };
    },

    _closeButton_template: function() {
        return {tag: "DIV", cls: "close"};
    },

    _message_template: function(type, message) {
        var template = acx.ut.message(message, type, "LI");
        this.config.showCloseBtn && template.children.push(this._closeButton_template());
        return $.create(template);
    }
});

acx.ui.BidiField = acx.ui.AbstractField.extend({
    _id: "BidiField",
    bidi: null,
    saveData: [],

    init: function(parent) {
        this._super();
        this._createBidi();
        this.el = this.bidi.el;
        if (parent) {
            this.bidi.appendTo(parent);
            this._initializeSelectedItems(parent);
        }
    },

    storeState: function() {
        this.saveData = this.bidi.getItems().map(function(record) {
            return { text: record.text, value: record.value, filtered: record.filtered, fixed: record.fixed, selected: record.selected };
        });
    },

    getSelectedStoredState: function() {
        return this.saveData.filter(function(element) {
            return (element.selected === true);
        }).map(function(entry){
            return entry.value;
        });
    },

    restoreState: function() {
        this.bidi.setItems(this.saveData);
    },

    _createBidi: function() {
        this.bidi = new acx.ui.Bidi({
            id: this.id("bidi"),
            width: this.config.width,
            listSize: this.config.listSize,
            required: this.config.required,
            leftTitleText: this.config.leftTitleText,
            rightTitleText: this.config.rightTitleText,
            items: this.config.items,
            showOrdering: this.config.showOrdering,
            onChange: this._populateBidiSelectedItems_handler
        });
    },

    _initializeSelectedItems: function(parent) {
        $.create({ tag: "span", id: this.id("selectedItems") }).appendTo(parent);
        if (!acx.isEmpty(this.bidi.getSelectedValues())) {
            this._populateBidiSelectedItems_handler(this.bidi);
        }
    },

    _populateBidiSelectedItems_handler: function(theBidi) {
        var parentEl = $("#" + this.id("selectedItems"));
        var fieldName = this.config.name;
        parentEl.html($.create(theBidi.getSelectedValues().map(function(val) {
            return {tag: "input", name: fieldName, type: "hidden", value: val };
        })));
        this.fire("bidiChanged", this.bidi);
    }

});

acx.ui.MarkupSelector = acx.ui.Widget.extend({
    _id: "_MarkupSelector",
    defaults: {
        markups: []
    },

    init: function(parent) {
        this._super(parent);
        this.checkboxes = [];
        this.el = $.create(this._main_template());

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    _main_template: function() {
        return { tag:"DIV", children: this.config.markups.map(this._markups_template_handler) };
    },

    _markups_template_handler: function(markup) {
        var chk = new acx.ui.CheckboxField({ id: "markupChk_" + markup, name: "DOCCONTROL_SEQUENCE", value: markup, label: markup, checked: true });
        this.checkboxes.push(chk);
        return { tag: "DIV", child: chk.el };
    }
});

acx.ui.FileSelector = acx.ui.AbstractField.extend({
    _id: "FileSelector",
    defaults: {
        // id
        // width
        // require
        showBlankFileRow: true,
        size: "medium",
        items: [],      // - an array of temporary files object { fileId, fileName, fileType, fileSize }
        value: null,      // file object { fileId, fileName, fileType, fileSize }
        panelTitleKey: "Widgets.FileSelector.Panel.Title"
    },

    init: function(parent) {
        this.files = new acx.data.MixedCollection({ keyFn: function(obj) {
            return obj.fileId;
        } });
        this.usedFiles = new acx.data.MixedCollection({ keyFn: function(obj) {
            return obj.fileId;
        } });

        this._make_multi_select_list();
        this._make_panel();
        this._super(parent);

        this.textEl = $.create(this._text_template());
        this.iconEl = $.create(this._icon_template());
        this.el = $.create(this._main_template());
        if (parent) {
            this.el.appendTo(parent);
        }

        this.loadItems(this.config.items);
        this.val(this.config.value);

        this._initEvents();
    },

    _initEvents: function() {
        this.el.bind("click", this._click_handler);
        this.multiSelectList.on("dblclick", this._select_file_handler);
        this.panel.commitButton.on("click", this._select_file_handler);
    },

    /* Event Handlers */
    _select_file_handler: function(jEv) {
        if (this.multiSelectList.el.find("OPTION:selected").length > 0) {
            this.val(this.files.get(this.multiSelectList.val()) || { fileId: "0", fileName: "", fileSize: "", fileType: "" });
        }
        this.panel.close();
        this.fire("change", { source: this, event: jEv });
    },

    _click_handler: function(jEv) {
        this.panel.open();
        this.fire("click", { source: this, jEv: jEv });
    },

    /* Templates */
    _icon_template: function() {
        return { tag: "DIV", cls: "bicon ic-file " + (this.config.require ? " isRequired" : "") };
    },

    _text_template: function() {
        return { tag: "DIV", cls: "file-selector-text" };
    },

    _main_template: function() {
        return ({
            tag: "DIV",
            id: this.id(),
            cls: "file-selector uiField uiIconField " + (this.config.width ? "" : this.config.size) + (this.config.icon !== "none" ? " uiIconField" : "") + (this.config.require ? " isRequired" : ""),
            css: { width: isNaN(this.config.width) ? this.config.width : this.config.width + "px" },
            children: [ this.iconEl, this.textEl ]
        });
    },

    /* Private Methods */
    _make_multi_select_list: function() {
        this.multiSelectList = new acx.ui.MultiSelectListField({
            id: this.id() + "_MultiSelectList",
            name: this.id() + "_MultiSelectList",
            showHintText: this.config.showBlankFileRow
        });
    },

    _make_panel: function() {
        this.panel = new acx.ui.DialogPanel({
            id: this.config.id ? this.config.id + "_panel" : "",
            titleKey: this.config.panelTitleKey,
            commitBtnConfig: {
                primary: true,
                baseKey: "Widgets.Generics.Ok"
            },
            width: 610,
            body: this.multiSelectList.el
        });
    },

    /* Public Methods */
    loadItems: function(items) {
        this.files.clear();
        this.files.addAll(items);
        this._refreshList();
    },

    addItem: function(item) {
        this.files.add(item);
        this._refreshList();
    },

    _refreshList: function() {
        this.multiSelectList.removeAll();
        this.files.sort("ASC", function(a, b) {
            return a.fileName > b.fileName ? 1 : -1;
        });
        this.multiSelectList.addItems(this.files.items.map(function(file) {
            return { value: file.fileId, displayText: file.fileName };
        }));
    },

    _isEmpty: function() {
        return this.value.fileId === "0";
    },

    _setInvalid: function(invalid) {
        if (this.config.showInvalid) {
            this._super(invalid);
            this.iconEl[invalid ? 'addClass' : 'removeClass']("invalid");
        }
    },

    /**
     * @description val function for setting/getting values
     * @param val - file object { fileId, fileName, fileType, fileSize }
     * @return file object { fileId, fileName, fileType, fileSize }
     */
    val: function(val) {
        if (val) {
            var currVal = this.val();
            if (currVal && currVal.fileId && parseInt(currVal.fileId, 10) > 0 && this.usedFiles.get(currVal.fileId)) {
                this.usedFiles.remove(currVal);
                this.files.add(currVal);
            }
            // remove selected files from files
            this.files.remove(val);

            // move that file to used files
            this.usedFiles.add(val);

            this.value = val;
            this.textEl[val.fileName ? "text" : "html"](val.fileName || "&nbsp;");
            this._refreshList();
        } else {
            return this.value;
        }
    }
});

acx.ui.CascadeSelectListField = acx.ui.SelectListField.extend({
    _id: "CascadeSelectListField",
    defaults: {
        items: [],        // Array of item objects containing name, value, selected, and parentId attributes to populate list
        hintText: acx.text("Widgets.Generics.Select")   // Creates a placeholder first option in the select list, set to null for no hint text
        //tooltip: null
        //size: "medium"
        //disable: false
        //showEdited: false
        //name: "",       (required) the name of the form element that will be submitted
        //value: "",      initial value of the field
        //require: false  is a value required when validation performed
    },

    init: function(parent) {
        this._super(parent);
    },

    _change_handler: function(jEv) {
        this.fire("change", this, { jEv: jEv, parentId: this.el.find("OPTION:selected").data("parentId") });
    },

    _options_template: function(option) {
        return { tag: "OPTION",
            text: (option.name === undefined ? (option.displayText === undefined ? option.value : option.displayText) : option.name),
            value: option.value,
            selected: option.selected,
            data: {
                parentId: option.parentId
            }
        };
    }
});

acx.ui.ReviewStatusSelectListField = acx.ui.SelectListField.extend({
    _id: "ReviewStatusSelectListField",
    defaults: {
        hintText: null
        // items: []
        // value: { value; <int>, displayText: <String> }
        // readOnly: <boolean>
    },

    init: function(parent) {
        if (this.config.readOnly) {
            this.el = $.create({ tag: "SPAN", text: this.config.value.displayText });
            if (parent) {
                this.el.appendTo(parent);
            }
        } else {
            this.config.value = this.config.value.value;
            this._super(parent);
        }
    }
});

acx.ui.FieldCollection = acx.ui.Widget.extend({
    _id: "_FieldCollection",
    defaults: {
        //fields    (required) json array of fields
        showEdited: false,
        documentId: 0,
        fileId: null,
        documentTypeIdsWithScheme: [],
        showMarkupRow: false,
        markups: [],
        template: acx.ut.DocFieldsTableTemplate
    },

    init: function(parent) {
        this._super();
        this.fields = new acx.data.MixedCollection();
        this.fieldTypes = this._getFileTypes();

        this._populate_field_collection();
        this.el = $.create(this.config.template(this._template_config_options()));
        if (parent) {
            this.el.appendTo(parent);
        }

        this._initEvents();
    },

    _template_config_options: function() {
        return {
            fieldConfigs: this.config.fields,
            fields: this.fields,
            id: this.id()
        };
    },

    _getFileTypes: function() {
        return {
            string:                acx.ui.TextField,
            ratio:                 acx.ui.RatioField,
            documentNumber:        acx.ui.DocumentNumberField,
            confidentialityStatus: acx.ui.ConfidentialField,
            "boolean":             acx.ui.CheckboxField,
            versionedMultiSelect:  acx.ui.DocVersionListField,
            multiSelect:           acx.ui.MultiSelectField,
            dropdown:              acx.ui.CascadeSelectListField,
            integer:               acx.ui.NumericField,
            date:                  acx.ui.DateField,
            textarea:              acx.ui.TextAreaField,
            file:                  acx.ui.FileField,
            viewer:                acx.ui.Viewer,
            markupSelector:        acx.ui.MarkupSelector,
            reviewStatus:          acx.ui.ReviewStatusSelectListField
        };
    },

    _populate_field_collection: function() {
        this.config.fields.forEach(function(field) {
            if (field) {
                var widget = this._buildWidget_handler(field);
                this._bindWidgetEvents_handler(field, widget);
                this.fields.add(field.id, widget);
            }
        }, this);
    },

    _buildWidget_handler: function(field) {
        return new this.fieldTypes[field.type](acx.extend({}, this._widgetConfiguration(field), field.config));
    },

    _widgetConfiguration: function(field) {
        return {
            id: field.id + "_" + this.config.documentId,
            name: field.id + "_" + this.config.documentId,
            documentId: this.config.documentId,                   //TODO Used by widgets required to have the documentId int he middle of their names until field name structure can be decoupled from backend
            showEdited: this.config.showEdited,
            childName: field.childName,
            setTabIndex: this.config.setTabIndex
        };
    },

    _bindWidgetEvents_handler: function(field, widget) {
        field.childName && widget.on("change", function(dd, jEv) {
            if (dd.val() !== "") {
                acx.ajax({
                    url: "/FieldValueHierarchy",
                    _action: "getChildValues",
                    viewName: "jsonView",
                    data: {
                        projectId: this.config.projectId,
                        selectedValueId: jEv.parentId,
                        childName: dd.config.childName
                    },
                    onStart: this._resetChildFields_handler,
                    onSuccess: this._loadChildValues_handler
                });
            } else {
                var childName = dd.config.childName;
                while (childName !== "") {
                    var childField = this.fields.get(childName);
                    if (childField) {
                        childField.removeAll().disable().val("");
                        childName = childField.config.childName;
                    } else {
                        childName = "";
                    }
                }
            }
        }.bind(this));
    },

    _resetChildFields_handler: function(xhrObj, req) {
        var childName = this.fields.get(req.data.childName).config.childName;
        while (childName !== "") {
            var childField = this.fields.get(childName);
            if (childField) {
                childField.removeAll().disable();
                childName = childField.config.childName;
            } else {
                childName = "";
            }
        }
    },

    _loadChildValues_handler: function(response, status, xhrObj, req) {
        var items = [], childField = this.fields.get(req.data.childName);
        response.selectedOptionList && response.selectedOptionList.map(function(option) {
            items.push({ name: option.displayText, value: option.value, parentId: option.parentId });
        });
        var lastVal = childField.val();
        childField.removeAll().addItems(items)[items.length === 0 ? "disable" : "enable"]();
        childField.setHintText(items.length === 0 ? childField.config.hintText : acx.text("Widgets.Generics.Select"));
        if (items.length === 1) {
            childField.val(items[0].value);
        } else if (lastVal !== "") {
            childField.val("");
        }
    },

    _initEvents: function() {
        parseInt(this.config.documentId, 10) === 0 && this.fields.get("doctype") && this.fields.get("doctype").on("change", this._docNumberScheme_handler);
    },

    _docNumberScheme_handler: function(docTypeEl) {
        if (this._docTypeHasScheme(docTypeEl.val())) {
            this.fields.get("docno").setMode("SCHEME_GENERATED");
        } else {
            this.fields.get("docno").setMode(this.fields.get("docno").autoNumberChk.isChecked() ? "AUTO_NUMBER" : "MANUAL");
        }
    },

    _docTypeHasScheme: function(selectedDocTypeId) {
        return this.config.documentTypeIdsWithScheme.filter(
            function(docTypeId) {
                return docTypeId === parseInt(selectedDocTypeId, 10);
            }, selectedDocTypeId).length > 0;
    },

    _enableEditHandler: function(enable) {
        this.fields.each(function(field) {
            field.enableEditHandler(enable);
        });
    },

    _setFieldValues: function(values, callBackFn) {
        this.config.fields.forEach(function(field) {
            var val = values[field.id], widget = this.fields.get(field.id);
            var fn = {
                documentNumber: this._setDocumentNumberFieldValue,
                file: this._setFileFieldValue,
                confidentialityStatus: this._setConfidentialityStatusFieldValue,
                date: this._setDateFieldValue,
                dropdown: this._setDropDownFieldValue,
                "boolean": this._setCheckBoxFieldValue,
                ratio: this._setRatioFieldValue,
                textarea: this._setTextAreaFieldValue,
                reviewStatus: this._setReviewStatusValue
            }[field.type];

            if (fn) {
                fn(widget, val);
            }
            else {
                widget.val(val);
            }
        }, this);
        callBackFn && callBackFn();
    },

    _getFieldValues: function() {
        var ret = {};
        this.config.fields.forEach(function(config) {
            var widget = this.fields.get(config.id);
            var fn = {
                documentNumber: this._getDocumentNumberFieldValue,
                confidentialityStatus: this._getConfidentialityFieldValue,
                dropdown: this._getDropDownFieldValue,
                date: this._getDateFieldValue,
                "boolean": this._getCheckBoxFieldValue,
                ratio: this._getRatioFieldValue,
                reviewStatus: this._getReviewStatusValue
            }[config.type];

            ret[config.id] = fn ? fn(widget) : widget.val();
        }, this);
        return ret;
    },

    _setTextAreaFieldValue: function(widget, val) {
        widget.val(val || "");
    },

    _setDocumentNumberFieldValue: function(widget, val) {
        widget.val(val.value);
        widget.setMode(val.numbertype, true);
    },

    _setFileFieldValue: function(widget, val) {
        widget.value = null;
        widget.val(val);
    },

    _setConfidentialityStatusFieldValue: function(widget, val) {
        widget.check(val.checked);
        if (val.checked) {
            widget.setSelectedUserIds(val.selectedUserIds);
            widget.refresh();
        } else {
            widget.clear();
        }
    },

    _setDateFieldValue: function(widget, val) {
        if (acx.isEmpty(val)) {
            widget.clear();
        } else {
            widget.val(acx.formatDate(val));
        }
    },

    _setReviewStatusValue: function(widget, val) {
        widget.val(val.value);
    },

    _setDropDownFieldValue: function(widget, val) {
        widget.val(val.value === "0" ? "" : val.value);
    },

    _setCheckBoxFieldValue: function(widget, val) {
        widget.check(acx.isObject(val) ? val.checked : false);
    },

    _setRatioFieldValue: function(widget, val) {
        widget.val({from: val.from, to: val.to});
    },

    _getDocumentNumberFieldValue: function(widget) {
        return {
            value: (widget.numberScheme.val() === "SCHEME_GENERATED" ? "" : widget.val()),
            numbertype: widget.numberScheme.val()
        };
    },

    _getConfidentialityFieldValue: function(widget) {
        return { checked: widget.isChecked(), selectedUserIds: widget.getSelectedUserIds() };
    },

    _getDropDownFieldValue: function(widget) {
        return { displayText: widget.val() ? widget.el.find("OPTION:selected").text() : "", value: widget.val() };
    },

    _getReviewStatusValue: function(widget) {
        return { displayText: widget.val() !== "6" ? widget.el.find("OPTION:selected").text() : "", value: widget.val(), readOnly: widget.isDisabled() };
    },

    _getDateFieldValue: function(widget) {
        return widget.hiddenField.val();
    },

    _getCheckBoxFieldValue: function(widget) {
        return { checked: widget.isChecked() };
    },

    _getRatioFieldValue: function(widget) {
        return widget.val() || { from: 0, to: 0 };
    },

    /* Public Methods */
    getFieldIdsByType: function(type) {
        var fieldIds = [];
        this.config.fields.forEach(function(field) {
            if (field.type === type) {
                fieldIds.push(field.id);
            }
        });
        return fieldIds;
    },

    getInvalidFields: function() {
        return this.fields.filterBy(function(field) {
            return field.require && !field.validate();
        });
    },

    getFieldsByType: function(type) {
        var fields = [];
        this.config.fields.forEach(function(field) {
            if (field.type === type) {
                fields.push(this.fields.get(field.id));
            }
        }, this);
        return fields;
    },

    getFieldById: function(id) {
        return this.fields.get(id);
    },

    val: function(values, fn) {
        if (values) {
            this._setFieldValues(values, fn);
        } else {
            return this._getFieldValues();
        }
    },
	getFieldValues: function() {
		var self = this;
		return this.config.fields.map(function(field) {
			return {id: field.id, value: self.getFieldById(field.id).val()};
		});
	},
	setFieldValues: function(fieldValues) {
		var self = this;
		fieldValues.forEach(function(field) {
			self.getFieldById(field.id).val(field.value);
		});
	}
});

acx.ui.DocPropertiesCollection = acx.ui.FieldCollection.extend({
    _id: "_FieldCollection",
    defaults: {
        //fields    (required) json array of fields
        //documentId: 0,
        fileId: null
    },

    init: function(parent) {
        this._super(parent);
    },

    _populate_field_collection: function() {
        this.config.fields.forEach(function(field) {
            if (field) {
                var commonConfig = {
                    id: field.id + "_" + this.config.documentId,
                    name: field.id + "_" + this.config.documentId,
                    documentId: this.config.documentId                   //TODO Used by widgets required to have the documentId int he middle of their names until field name structure can be decoupled from backend
                };

                //TODO this is in here because there is special handling in ControlledDocView.jsp
                //for rendering brs in comments. A better fix would be handling \ns here
                var widget = (field.valueAsHTML) ? { tag: "DIV", css: { marginTop: "2px" }, html: field.valueAsHTML } : { tag: "DIV", css: { marginTop: "2px" }, text: field.valueAsString };
                if (field.classType) {
                    widget = new field.classType(acx.extend({}, commonConfig, field.config));
                }
                this.fields.add(field.id, widget);
            }
        }, this);
    }
});

acx.ui.Callout = acx.ui.Widget.extend({
    defaults: {
        caller: undefined,
        content: '',
        fadeInDuration: 50,
        fadeOutDuration: 100,
        position: 'right'
    },

    init: function() {
        this.$body = $('body');
        this.$caller = $(this.config.caller);

        this.GLOBAL_CLICK_EVENT = 'click.callout';
        this.GLOBAL_SCROLL_EVENT = 'scroll.callout';

        this.closeButton = $.create(this._closeButton_template());
        this.content = $.create(this._content_template());
        this.el = $.create(this._main_template()).hide();

        this._body_click_handler = this._body_click_handler_generator();
        this._parent_scroll_handler = this._parent_scroll_handler_generator();
    },

    show: function() {
        this.el.appendTo('body').fadeIn(this.config.fadeInDuration);
        this._reposition();
        this._bindHideEvent();
        this._bindScrollEvent();
    },

    hide: function() {
        this.el.fadeOut(this.config.fadeOutDuration, function() {
            this.el.detach();
        }.bind(this));
        this._unbindHideEvent();
        this._unbindScrollEvent();
    },

    setContent: function(content) {
        this.content.empty().append(content.escapeHtml());
    },

    _reposition: function() {
        this.el.css(this._generateCssProperties());
    },

    _generateCssProperties: function() {
        var caller = this.getCallerPosition(), calloutWidth = this.el.outerWidth(), calloutHeight = this.el.outerHeight(), defaultProperties = {
            position: 'absolute'
        };

        var positioningRules = {
            right: function() {
                return acx.extend({}, defaultProperties, {
                    top: caller.top + (caller.height / 2),
                    left: caller.left + caller.width,
                    marginTop: (calloutHeight / -2)
                });
            },
            bottomLeft: function() {
                return acx.extend({}, defaultProperties, {
                    top: caller.top + caller.height,
                    left: caller.right - calloutWidth
                });
            }
        };

        var getPositioningRule = positioningRules[this.config.position] || positioningRules[this.defaults.position];

        return getPositioningRule();
    },

    getCallerPosition: function() {
        var offset = this.$caller.offset(), width = this.$caller.width(), height = this.$caller.height();

        return {
            top: offset.top,
            bottom: offset.top + height,
            left: offset.left,
            right: offset.left + width,
            width: width,
            height: height
        };
    },

    _bindHideEvent: function() {
        this.$body.on(this.GLOBAL_CLICK_EVENT, this._body_click_handler);
    },

    _body_click_handler_generator: function() {
        return function(jEv) {
            var $target = $(jEv.target);
            if ($target.closest(this.el).length || $target.closest(this.$caller).length) {
                return;
            }
            this.hide();
        }.bind(this);
    },

    _unbindHideEvent: function() {
        this.$body.off(this.GLOBAL_CLICK_EVENT, this._body_click_handler);
    },

    _bindScrollEvent: function() {
        this.$caller.parents().on(this.GLOBAL_SCROLL_EVENT, this._parent_scroll_handler);
    },

    _parent_scroll_handler_generator: function() {
        return function(jEv) {
            this._reposition();
            jEv.stopPropagation();
        }.bind(this);
    },

    _unbindScrollEvent: function() {
        this.$caller.parents().off(this.GLOBAL_SCROLL_EVENT, this._parent_scroll_handler);
    },

    _main_template: function() {
        return { tag: 'DIV', cls: 'callout callout-' + this.config.position, children: [
            this.closeButton,
            this.content,
            { tag: 'DIV', cls: 'border-notch notch' },
            { tag: 'DIV', cls: 'notch' }
        ] };
    },

    _closeButton_template: function() {
        return { tag: 'DIV', cls: 'closeButton', onclick: this.hide.bind(this) };
    },

    _content_template: function() {
        return { tag: 'DIV', cls: 'calloutContent', child: this.config.content };
    }
});

acx.ui.Viewer = acx.ui.Widget.extend({
    _id: "Viewer",
    defaults: {
        controller: "OpenOnlineViewer",
        action: "openViewerInReadOnlyModeForDocuments", //Read-only action = openViewerInReadOnlyModeForDocuments & Markup-mode action=openViewerInMarkupModeForDocuments
        documentId: null    // (required)
    },

    init: function(parent) {
        this._super();

        this.el = $.create(this._main_template());

        if (parent) {
            this.el.appendTo(parent);
        }

        this.url = "/" + this.config.controller +
            "?_action=" + this.config.action +
            "&viewName=doccontrol/jVue" +
            "&controlledDocumentId=" + this.config.documentId;
    },

    open: function() {
        this._open_handler();
    },

    _open_handler: function() {
        if (this.viewerWindow) {
            this.viewerWindow.focus();
        } else {
            this.viewerWindow = window.open(this.url, "Viewer", "toolbar=0,status=1,location=no,menubar=no,directories=no,scrollbars=no,resizable=yes,screenX=0,screenY=0,left=20,top=20,width=800,height=600");
            var unloadInterval = setInterval(function() {
                if (!this.viewerWindow || this.viewerWindow.closed) {
                    clearInterval(unloadInterval);
                    delete this.viewerWindow;
                }
            }.bind(this), 500);
        }
    },

    _main_template: function() {
        return { tag: "DIV",
            css: { height: "14px", width: "17px", cursor: "pointer", background: "url('/html/Images/ic_show.gif') scroll no-repeat 0 3px" },
            title: acx.text("Widgets.Viewer.OpenFileInMarkupViewer"),
            onclick: this._open_handler };
    }

});

acx.ui.ActionGuide = acx.ui.Widget.extend({
    _id: "ActionGuide",
    defaults: {
        messageType: "success",
//      message:               // (required) $.create template or text
        primaryActions: [],    // array of objects { title, text, action (function) }
        secondaryActions: [],  // array of objects { title, text, action (function) }
        data: null             // additional data passed to each action
    },

    init: function(parent) {
        this.messages = new acx.ui.MessageBar({ id: this.id("messages") })
            .add(this.config.messageType, { tag: "H3", child: this.config.message});
        this.el = $.create(this._main_template());
        if (parent) {
            this.el.appendTo(parent);
        }
    },

    _hasSecondaryActions: function() {
        return acx.isArray(this.config.secondaryActions) && this.config.secondaryActions.length > 0;
    },

    _actionExecute_handler: function(listItem) {
        if (typeof(listItem.action) === "string") {
            return function() {
                acx.loader.show();
                location.href = listItem.action;
            };
        } else {
            return function() {
                listItem.action(this.config.data, listItem);
            }.bind(this);
        }
    },

    _main_template: function() {
        return { tag: "DIV", cls: "actionGuide" + (this._hasSecondaryActions() ? '' : ' actionGuide-primaryActionsOnly'), id: this.id(), children: [
            this.messages,
            { tag: "DIV", cls: "actionGuide-body clearFloats", children: [
                this._actions_template("actionGuide-secondary", acx.text("Widgets.ActionGuide.RelatedTasks"), this.config.secondaryActions),
                this._actions_template("actionGuide-primary", acx.text("Widgets.ActionGuide.NextSteps"), this.config.primaryActions)
            ]}
        ]};
    },

    _actions_template: function(cls, title, list) {
        return list.length ? { tag: "DIV", cls: cls, children: [
            { tag: "H3", text: title },
            { tag: "UL", children: list.map(this._action_template, this) }
        ]} : null;
    },

    _action_template: function(action) {
        return { tag: "LI", children: [
            { tag: "H4", id: action.id, cls: "actionGuide-actionTitle textlink", text: action.title, onclick: this._actionExecute_handler(action) },
            { tag: "DIV", cls: "actionGuide-actionText", text: action.text }
        ]};
    }
});

/**
 * acx.ui.Page
 */

acx.ui.Page = acx.views.View.extend({
    _id: "Page",
    defaults: {
        leftButtons: [],
        rightButtons: [],
        message: null,
        main: null,
        titleText: "",
        titleKey: ""
    },
    init: function(parent) {
        this._super();
        this.parent = parent;
        this._initElements();
        this.el = $.create(this._page_template());
        if (parent) {
            this.appendTo(parent);
        }
    },
    _initElements: function() {
        this.messageBar = new acx.ui.MessageBar({ id: this.id("messagePanel"), showCloseBtn: true});
        !acx.isEmpty(this.config.message) && this.messageBar.add(this.config.message.type, this.config.message.message);
        this.title = $.create(this._title_template());
        this.leftButtons = $.create(this._leftButtons_template());
        this.rightButtons = $.create(this._rightButtons_template());
        this.main = $.create(this._main_template());
    },
    _title_template: function() {
        return { tag: "H1", text: acx.text(this.config.titleKey) || this.config.titleText };
    },
    _leftButtons_template: function() {
        return { tag: "DIV", id: this.id("toolbar_left"), cls: "flow_left", children: [ this.title ].concat(this.config.leftButtons)  };
    },
    _rightButtons_template: function() {
        return { tag: "DIV", id: this.id("toolbar_right"), cls: "flow_right", children: this.config.rightButtons  };
    },
    _main_template: function() {
        return { tag: "DIV", id: this.id("main"), cls: "page-main", child: this.config.main };
    },
    _page_template: function() {
        return (
        { tag: "DIV", id: this.id("page"), cls: "page", children: [
            { tag: "DIV", id: this.id("header"), cls: "page-header", children: [
                { tag: "DIV", cls: "toolbar clearFloats noprint", children: [
                    this.leftButtons,
                    this.rightButtons
                ] }
            ] },
            this.messageBar,
            this.main
        ]}
            );
    }
});

acx.ui.FullPage = acx.views.View.extend({
    _id: "FullPage",
    defaults: {
        // i18n text for the title of the page
        title: null,
        // Config for enabling help link
        help: true,
        notification: null
    },

    init: function(parent) {
        this._super();
        this.parent = parent;
        this._initPage();

        if (parent) {
            this.el.appendTo(parent);
        }
    },

    _initPage: function() {
        if (this.config.help) {
            this.helpLink = $.create(this._helpLink_template());
            this._requestHelpParameters();
        }

        this._initElements();
    },
    _initElements: function() {
        this.messageBar = new acx.ui.MessageBar({ id: this.id("messagePanel"), showCloseBtn: true});
        this.container = $.create(this._container_template());
        this.el = $.create(this._page_template());
    },
    _requestHelpParameters: function() {
        acx.ajax({
            url: "/Navigation",
            _action: "displayNavigation",
            viewName: "jsonView",
            projectId: -1,
            data: "navigationData=HELP",
            onSuccess: this._addHelpLink.bind(this)
        });
    },
    _addHelpLink: function(response) {
        this.helpParameters = response.HELP;
        this.helpLink.click(this._helpLink_handler);
    },

    _helpLink_handler: function() {
        if (this.helpPanel) {
            this.helpPanel.open();
        }
        else {
            this.helpPanel = new acx.ui.HelpPanel({
                helpNumber: this.helpParameters.helpNumber,
                helpSearchUri: this.helpParameters.helpSearchUri,
                helpMessage: acx.text("MainMenu.HelpPanel.HelpForPage"),
                orgId: this.config.organizationId
            });
            this.helpPanel.open();
        }
    },

    _page_template: function() {
        return {
            cls: "fullpage", children: [
                {cls: "page-header", children: [
                    {tag: "SPAN", cls: "nav-logo"},
                    {cls: "nav-extras", children: [
                        this.helpLink
                    ]}
                ]},
                {cls: "boxBlock", children: [
                    {tag: "H1", cls: "nav-barRow", text: this.config.title},
                    {cls: "page-main", children: [
                        this.config.notification && {cls: "message note", html: this.config.notification},
                        this.messageBar,
                        this.container
                    ]}
                ]}
            ]
        };
    },
    _container_template: function() {
        return { tag: "DIV", id: this.id("container"), cls: "page-container", child: this.config.content };
    },
    _helpLink_template: function() {
        return  {cls: "nav-help", children: [
            {cls: "nav-helpText", children: [
                {cls: "nav-helpIcon"},
                {tag: "SPAN", text: acx.text('MainMenu.Help')}
            ]}
        ]};
    }
});

acx.ui.DoubleDeckerTextField = acx.ui.TextField.extend({
    _id: "DoubleDeckerTextField",
    defaults: {
        label: ""
    },
    baseClass: "uiDDTextField",
    _main_template: function() {
        var template = this._super();
        template.child[2] = this._label_template();
        template.child.push(this.field);

        return template;
    },
    _label_template: function() {
        return { tag: "LABEL", cls: "hint", "for": (this.config.id + '-input'), text: this.config.label };
    },
    _field_template: function() {
        var template = this._super();
        template.id = this.config.id + '-input';

        return template;
    }
});

acx.ui.NumberField = acx.ui.TextField.extend({
    _id: "NumberField",
    defaults: {
        label: ""
    },
    baseClass: "uiNumberField"
});

acx.helpers.setResultNavigatorModel = function(sessionModel) {
    var storeKey = "acx.viewMail.services.ResultsNavigatorService";
    try {
        window.sessionStorage.setItem(storeKey, JSON.stringify(sessionModel));
        window.sessionStorage.removeItem(storeKey + ".expectedIndex" );
    } catch(e) {}
};