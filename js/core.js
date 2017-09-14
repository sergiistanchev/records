/**
 * core.js
 * @author the regents of aconex ui
 */

(function () {

    var window = this, $ = window.jQuery, acx = {};

    /**
     * global acx namespace
     * @namespace
     * @name acx
     */
    window.acx = acx;

    /**
     * generic object iterator
     * @function
     */
    acx.each = $.each;

    /**
     * uses object iterator to return an array of elements produced by the fn parameter
     * @function
     */
    acx.eachMap = function (obj, fn, thisp) {
        var ret = [];
        for (var n in obj) {
            ret.push(fn.call(thisp, n, obj[n], obj));
        }
        return ret;
    };

    /**
     * returns the value of a given attribute from the location bar
     * @function
     * @param attr (string name of the attribute being requested)
     */
    acx.location = window.location;
    acx.locationBarAttributeFor = function (attr) {
        var args = acx.location.search.substring(1).split("&").reduce(function (r, p) {
            r[decodeURIComponent(p.split("=")[0])] = decodeURIComponent(p.split("=")[1]);
            return r;
        }, {});
        return args[attr] || "";
    };

    /**
     * extends the first argument with the properties of the second and subsequent arguments
     * @function
     */
    acx.extend = $.extend;

    /**
     * augments the first argument with the properties of the second and subsequent arguments
     * like {@link acx.extend} except that existing properties are not overwritten
     */
    acx.augment = function () {
        var args = Array.prototype.slice.call(arguments), src = (args.length === 1) ? this : args.shift(), augf = function (n, v) {
            if (!(n in src)) {
                src[n] = v;
            }
        };
        for (var i = 0; i < args.length; i++) {
            acx.each(args[i], augf);
        }
        return src;
    };

    /**
     * tests whether the argument is an array
     * @function
     */
    acx.isArray = $.isArray;

    /**
     * tests whether the argument is an object
     * @function
     */
    acx.isObject = function (value) {
        return !acx.isEmpty(value) && Object.prototype.toString.call(value) === "[object Object]";
    };

    /**
     * tests whether the argument is a date
     * @function
     */
    acx.isDate = function (value) {
        return Object.prototype.toString.call(value) === "[object Date]";
    };

    /**
     * tests whether the value is blank or empty
     * @function
     */
    acx.isEmpty = function (value, allowBlank) {
        return value === null || value === undefined || ((acx.isArray(value) && !value.length)) || (!allowBlank ? $.trim(value) === '' : false);
    };

    /**
     * compare obj1 and obj2 values
     * @param obj1
     * @param obj2
     */
    acx.compare = function (obj1, obj2) {
        for (var key in obj1) {
            if (acx.isArray(obj1[key])) {
                if (!obj1[key].compare(obj2[key])) {
                    return false;
                }
            } else if (acx.isObject(obj1[key])) {
                if (!acx.compare(obj1[key], obj2[key])) {
                    return false;
                }
            } else {
                if (obj1[key] !== obj2[key]) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * creates and parses a string to a date object
     * @function
     */
    acx.parseDate = function (dateString, fmtArg, forceStrMonth) {
        var format = fmtArg || (top.mainMenu ? top.mainMenu.getDateFormat() : false) || window.localeDateFormat, formatTokens = format.match(/%./g), months = ([].concat(window.JSCal.i18n.mn).concat(window.JSCal.i18n.smn)).map(function (month) {
            return month.toLowerCase();
        }), fragmentIndexFrom = function (token) {
            return validators.reduce(function (returnVal, validator, i) {
                return validator.tokens.contains(token) ? i : returnVal;
            }, null);
        }, validators = [
            { tokens: "%y%Y", min: 1900, max: 2999, parse: function (year) {
                year = parseInt(year, 10);
                return year + (year < 100 ? Math.floor(((new Date()).getFullYear() + 50 - year) / 100) * 100 : 0);
            } },
            { tokens: "%m%b%B", min: 0, max: 11, parse: function (month) {
                return ((!forceStrMonth && parseInt(month, 10)) || 1 + (months.indexOf(month.toLowerCase()) % 12)) - 1;
            } },
            { tokens: "%d%e", min: 1, max: 31, parse: function (date) {
                return parseInt(date, 10);
            } }
        ];

        if (typeof dateString === "string") {
            var dateFragments = (dateString.match(/^\d+$/) ?
                (dateString.match(new RegExp(formatTokens.map(
                    function (token) {
                        return (token.match(/%y/i) && dateString.length > (formatTokens.length * 2)) ? "(....)" : "(..)";
                    }).join(""))) || [0, "e"]).slice(1) :
                dateString.split(/\W+/));

            var parseDate = function () {
                var parsedFragments = [0, 0, 0], isValidDate = dateFragments.reduce(function (isValid, value, i) {
                    var fragmentIndex = fragmentIndexFrom(formatTokens[i]);

                    if (fragmentIndex === null) {
                        return isValid;
                    }

                    var validator = validators[fragmentIndex], parsedValue = parsedFragments[fragmentIndex] = validator.parse(value), isWithinRange = (parsedValue >= validator.min && parsedValue <= validator.max);

                    return isValid && isWithinRange;
                }, true), dateFromParsedFragments = function () {
                    return new Date(parsedFragments[0], parsedFragments[1], parsedFragments[2], 12, 0) || false;
                };

                return isValidDate && dateFromParsedFragments();
            };

            return parseDate() ||
                (!forceStrMonth && acx.parseDate(dateString, "%m%d%y", true)) ||
                (!forceStrMonth && acx.parseDate(dateString, "%d%m%y", true));
        } else {
            return false;
        }
    };

    /**
     * formats a date object to match a supplied format
     * so far only handles date, month and year parts of the date object.
     * @function
     */
    acx.formatDate = function (D, targetFormat, sourceFormat) {
        var fmt = targetFormat || (top.mainMenu ? top.mainMenu.getDateFormat() : false) || window.localeDateFormat || "%Y-%m-%d";

        if (!acx.isDate(D)) {
            D = acx.parseDate(D, sourceFormat || "%Y-%m-%d");
        }
        if (acx.isEmpty(D) || !D) {
            return false;
        }

        var month = D.getMonth(), date = D.getDate(), fullYear = D.getFullYear(), dateOptions = {
            "%d": date < 10 ? "0" + date : date,
            "%m": month < 9 ? "0" + (1 + month) : 1 + month,
            "%Y": fullYear
        };

        return fmt.replace(/%./g, function (datePart) {
            return dateOptions[datePart];
        });
    };

    /**
     * tests whether the argument is a function
     * @function
     */
    acx.isFunction = $.isFunction;

    /**
     * test whether the argument is numeric
     * @param value
     */
    acx.isNumeric = function (value) {
        return value !== null && !isNaN(value);
    };

    /**
     * Shared regular expressions
     */
    acx.regex = {
        email: /^(([a-z0-9&'+=_-](\.(?!@))?)+)\@(((([a-z]|[0-9]|\b(-+)\b){1,64})\.)+([a-z]+))$/i,
        number: /^[+-]?\d*\.?\d+$/
    };

    /**
     * data type for performing chainable geometry calculations<br>
     * can be initialised x,y | {x, y} | {left, top}
     */
    acx.vector = function (x, y) {
        return new acx.vector.prototype.Init(x, y);
    };

    acx.vector.prototype = {
        Init: function (x, y) {
            x = x || 0;
            this.y = isFinite(x.y) ? x.y : (isFinite(x.top) ? x.top : (isFinite(y) ? y : 0));
            this.x = isFinite(x.x) ? x.x : (isFinite(x.left) ? x.left : (isFinite(x) ? x : 0));
        },

        add: function (i, j) {
            var d = acx.vector(i, j);
            return new this.Init(this.x + d.x, this.y + d.y);
        },

        sub: function (i, j) {
            var d = acx.vector(i, j);
            return new this.Init(this.x - d.x, this.y - d.y);
        },

        addX: function (i) {
            return new this.Init(this.x + i, this.y);
        },

        addY: function (j) {
            return new this.Init(this.x, this.y + j);
        },

        mod: function (fn) { // runs a function against the x and y values
            return new this.Init({x: fn.call(this, this.x, "x"), y: fn.call(this, this.y, "y")});
        },

        /** returns true if this is within a rectangle formed by the points p and q */
        within: function (p, q) {
            return ( this.x >= ((p.x < q.x) ? p.x : q.x) && this.x <= ((p.x > q.x) ? p.x : q.x) &&
                this.y >= ((p.y < q.y) ? p.y : q.y) && this.y <= ((p.y > q.y) ? p.y : q.y) );
        },

        asOffset: function () {
            return {top: this.y, left: this.x};
        },

        asSize: function () {
            return {height: this.y, width: this.x};
        }
    };

    acx.vector.prototype.Init.prototype = acx.vector.prototype;

    /**
     * short cut functions for working with vectors and jquery.
     * Each function returns the equivalent jquery value in a two dimentional vector
     */
    $.fn.vSize = function () {
        return acx.vector(this.width(), this.height());
    };
    $.fn.vOuterSize = function (margin) {
        return acx.vector(this.outerWidth(margin), this.outerHeight(margin));
    };
    $.fn.vScroll = function () {
        return acx.vector(this.scrollLeft(), this.scrollTop());
    };
    $.fn.vOffset = function () {
        return acx.vector(this.offset());
    };
    $.fn.vPosition = function () {
        return acx.vector(this.position());
    };
    $.Event.prototype.vMouse = function () {
        return acx.vector(this.pageX, this.pageY);
    };

    /**
     * Array prototype extensions
     */
    acx.augment(Array.prototype, {
        'contains': function (needle) {
            return this.indexOf(needle) !== -1;
        },

        'compare': function (arr) {
            if (this.length !== arr.length) {
                return false;
            }
            for (var i = 0; i < arr.length; i++) {
                if (this[i] !== arr[i]) {
                    return false;
                }
            }
            return true;
        },

        intersect: function (array) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                if (array.contains(this[i]) && !result.contains(this[i])) {
                    result.push(this[i]);
                }
            }
            return result;
        }
    });

    /**
     * Function prototype extensions
     */
    acx.augment(Function.prototype, {
        'delay': function () {
            var method = this, args = Array.prototype.slice.call(arguments), timeout = args.shift();
            return window.setTimeout(function () {
                return method.apply(method, args);
            }, timeout);
        }
    });

    /**
     * String prototype extensions
     */
    acx.augment(String.prototype, {
        'contains': function (needle) {
            return this.indexOf(needle) !== -1;
        },

        'equalsIgnoreCase': function (match) {
            return this.toLowerCase() === match.toLowerCase();
        },

        'escapeHtml': function () {
            return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },

        'escapeJS': function () {
            var meta = {'"': '\\"', '\\': '\\\\', '/': '\\/', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'}, xfrm = function (c) {
                return meta[c] || "\\u" + c.charCodeAt(0).toString(16).zeroPad(4);
            };
            return this.replace(new RegExp('(["\\\\\x00-\x1f\x7f-\uffff])', 'g'), xfrm);
        },

        'escapeRegExp': function () {
            var ret = "", esc = "\\^$*+?.()=|{,}[]-";
            for (var i = 0; i < this.length; i++) {
                ret += (esc.contains(this.charAt(i)) ? "\\" : "") + this.charAt(i);
            }
            return ret;
        },

        'zeroPad': function (len) {
            return ("0000000000" + this).substring(this.length - len + 10);
        }
    });

    /**
     * contains a series of flags indicating which browser is in use and the presence of different browser features or bugs<br>
     * Contains the following flags<br>
     * <ul>
     *  <li> all properties from <a href="http://docs.jquery.com/Utilities/jQuery.support">jQuery.support</a>
     *  <li> safari, opera, msie, mozilla - which rendering engine is in use
     *  <li> version - a string in format A.B.C representing the browser version
     *  <li> ie6, ie7 and ie67 shortcuts to determine exact browser
     * </ul>
     * @field
     */

        // Extract of jQuery 1.8.x of deprecated $.browser
    (function () {

        var matched, browser;

        // HACK: Have changed uaMatch() to only be local so as not to pollute the jQuery namespace
        var uaMatch = function (ua) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

            return {
                browser: match[1] || "",
                version: match[2] || "0"
            };
        };

        matched = uaMatch(navigator.userAgent);
        browser = {};

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }

        // Chrome is Webkit, but Webkit is also Safari.
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }

        acx.browser = browser;
        acx.extend(acx.browser, $.support);

        acx.browser.major = parseInt(acx.browser.version, 10);
        acx.browser.ie6 = acx.browser.msie && acx.browser.major === 6;
        acx.browser.ie7 = acx.browser.msie && acx.browser.major === 7;
        acx.browser.ie8 = acx.browser.msie && acx.browser.major === 8;
        acx.browser.ie9 = acx.browser.msie && acx.browser.major === 9;
        acx.browser.ie67 = acx.browser.ie6 || acx.browser.ie7;
        acx.browser.ie678 = acx.browser.ie67 || acx.browser.ie8;
    })();

    $(function () {
        acx.each(acx.browser, function (n, v, b) {
            if (v === true && (b = n.match(/ie$|^moz|^saf/))) {
                document.body.className += b[0] + " " + b[0] + acx.browser.major;
            }
        });

		if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
			document.body.className += ' ios';
		} else if (/android/i.test(window.navigator.userAgent)) {
			document.body.className += ' android';
		}
    });
    /**
     * base class for creating inheritable classes
     * based on resigs 'Simple Javascript Inheritance Class' (based on base2 and prototypejs)
     * modified with static super and auto config
     * @name Class
     * @constructor
     */
    (function () {
        var initializing = false, xyz, fnTest = /xyz/.test(function () {
            xyz;
        }) ? /\b_super\b/ : /.*/;

        this.Class = function () {
        };

        this.Class.extend = function extend(prop) {
            function Class() {
                if (!initializing) {
                    var args = Array.prototype.slice.call(arguments);
                    if (this.makeConfig) {
                        this.config = $.extend((function func(t) { // automatically construct a config object based on defaults and last item passed into the constructor
                            return $.extend(t._proto && t._proto() && func(t._proto()) || {}, t.defaults);
                        })(this), args.pop());
                    }
                    this.init && this.init.apply(this, args); // automatically run the init function when class created
                }
            }

            initializing = true;
            var This = this, prototype = new This();
            initializing = false;

            var _super = this.prototype;
            prototype._proto = function () {
                return _super;
            };

            var makeFunctionWrapper = function (name, fn) {
                return function () {
                    this._super = _super[name];
                    return fn.apply(this, arguments);
                };
            };

            for (var name in prop) {
                prototype[name] = typeof prop[name] === "function" && typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                    makeFunctionWrapper(name, prop[name]) : prop[name];
            }

            Class.prototype = prototype;
            Class.constructor = Class;

            Class.extend = extend; // make class extendable

            return Class;
        };
    })();

    /**
     * provides text formatting and i18n key storage features<br>
     * implements most of the Sun Java MessageFormat functionality.
     * @see <a href="http://java.sun.com/j2se/1.5.0/docs/api/java/text/MessageFormat.html" target="sun">Sun's Documentation</a>
     * @namespace
     */
    acx.i18n = (function () {
        var me = {};

        /**
         * the collections of keys in memory
         */
        var keys = {};

        var rtl = false;

        /**
         * formats a message using the provided arguments
         */
        var format = function (message, args) {
            var substitute = function () {
                var format = arguments[1].split(',');
                var substr = window.escape(args[format.shift()]);
                if (format.length === 0) {
                    return substr; // simple substitution eg {0}
                }
                switch (format.shift()) {
                    case "number" :
                        return (Number(substr)).toLocaleString();
                    case "date" :
                        return (new Date(+substr)).toLocaleDateString(); // date and time require milliseconds since epoch
                    case "time" :
                        return (new Date(+substr)).toLocaleTimeString(); //  eg acx.text("Key", +(new Date())); for current time
                }
                var styles = format.join("").split("|").map(function (style) {
                    return style.match(/(-?[\.\d]+)(#|<)([^{}]*)/);
                });
                var match = styles[0][3];
                for (var i = 0; i < styles.length; i++) {
                    if ((styles[i][2] === "#" && (+styles[i][1]) === (+substr)) ||
                        (styles[i][2] === "<" && ((+styles[i][1]) < (+substr)))) {
                        match = styles[i][3];
                    }
                }
                return match;
            };

            if (message === undefined) {
                return message;
            }

            // split message into formatting parts (mostly processed by the regexp)
            return message.replace(/'(')|'([^']+)'|([^{']+)|([^']+)/g, function (x, sq, qs, ss, sub) {

                // keep replacing substitutions (recursively) until none remain
                do {
                } while (sub && (sub !== (sub = (sub.replace(/\{([^{}]+)\}/, substitute)))));

                return sq || qs || ss || window.unescape(sub);
            });
        };

        me.setRtl = function (flag) {
            rtl = flag;
        };

        me.isRtl = function () {
            return rtl;
        };

		me.exportKeys = function() {
			return keys;
		};

        /**
         * set an i18n key for later use<br>
         * normally only called indirectly from a jsp via &lt;tags:i18nKey&gt;
         * which performs the i18n lookup based on the users language preference
         * @function
         * @name acx.i18n.setKey
         */
        me.setKey = function (key, value) {
            keys[key] = value;
        };

        /**
         * sets a group i18n key for later use<br>
         * normally only called indirectly from AconexResourceServlet
         * @function
         * @name acx.i18n.setKeys
         */
        me.setKeys = function (strings) {
            for (var key in strings) {
                keys[key] = strings[key];
            }
        };
        /**
         * convert an i18n key to text and format using the Java MessageFormat standard <br>
         * use shortcut {@link acx.text}
         * @name acx.i18n.formatKey
         * @function
         */
        me.formatKey = function () {
            var args = Array.prototype.slice.call(arguments), key = keys[args.shift()];
            if (args.length === 0) {
                return key;
            }
            return format(key, args);
        };

        /**
         * format a text string using the Java MessageFormat standard
         * @name acx.i18n.formatText
         * @function
         */
        me.formatText = function (key, args) {
            return format(key, acx.isArray(args) ? args : [args]);
        };

        /**
         * format a key substituting non-string values. Returns an array
         * limited to simple substitution types, useful for passing to $.create
         */
        var brtag = {tag: "BR"};
        me.formatComplex = function () {
            var args = Array.prototype.slice.call(arguments),
                key = keys[args.shift()],
                ret = [],
                replace = function (x, nl, sq, qs, ss, sub) {
                    ret.push(( nl && brtag ) || sq || qs || ss || args[+sub]);
                    return "";
                };
            do {
            } while (key && key !== (key = key.replace(/([\n\r])|'(')|'([^'\r\n]+)'|([^{'\r\n]+)|\{(\d+)\}/, replace)));
            return ret;
        };

        return me;
    })();

    /**
     * perform ajax requests
     * @function
     */
    acx.ajax = function (options) {
        var req = {};
        var xhrObj = null;
        var dispatch = function (name, args) {
            return req[name] && req[name].apply(req.context || req, args);
        };
        var defaults = {
            url: document.location.href,
            type: "POST",
            timeout: 0,
            timeoutRedirect: function () {
                top.location.href = "/html/security/timeout.jsp";
            },
            unauthorizedRedirect: function () {
                location.href = "/html/security/accessDenied.jsp";
                acx.loader.hide();
            }
        };
        var base = {
            beforeSend: function (xhr, opts) {
                xhrObj = xhr; // steal the xhr so we can use it in future callbacks
                return dispatch('onStart', [xhrObj, req]);
            },
            dataFilter: function (data, type) {
                dispatch('onReady', [type, xhrObj, req]);
                return data;
            },
            success: function (data, status) {
                dispatch('onSuccess', [data, status, xhrObj, req]);
            },
            error: function (xhr, status, error) {
                if (dispatch('onError', [status, error, xhrObj, req]) === false) {
                    return;
                }
                switch (status) {
                    case "timeout" :
                        window.alert(acx.text(req.timeout_alert || "General.AjaxRequestTimeout_alert"));
                        break;
                    case "error" :
                        if (xhr.status === 403 && xhrObj.getResponseHeader("X-Aconex-Timeout") === "1") {
                            req.timeoutRedirect();
                            return;
                        }
                        if (xhr.status === 401) {
                            req.unauthorizedRedirect();
                            return;
                        }
                        if (acx.isEmpty(xhrObj.responseText)) {
                            return; // do not write non-existant error text, caused when xhr is aborted by the browser (eg if calling frame unloads)
                        }
                        var doc = top.document;
                        doc.open();
                        doc.write(xhrObj.responseText);
                        doc.close();
                        break;
                    default:
                        throw("Unknown ajax request failure (" + status + ") " + error.toString());
                }
            },
            complete: function (xhr) {
                dispatch('onFinish', [xhrObj, req]);
            }
        };
        acx.extend(req, defaults, options, base);
        if ('data' in req && (req.data instanceof $)) {
            req.data = req.data.serialize();
        }
        ['action', '_action', 'viewName', 'projectId'].forEach(function (v) {
            if (v in req) {
                req.url += (req.url.contains("?") ? "&" : "?") + (req[v] != null ? ( encodeURIComponent(v) + "=" + encodeURIComponent(req[v])) : "");
            }
        });
        return $.ajax(req);
    };

// ensure Spring compatible array serialisation
    $.ajaxSettings.traditional = true;


    /**
     * Create DOM elements and wrap them in jQuery using a single element definition
     */
    $.create = function (elementDef, parentNode) {
        var context = (parentNode && parentNode.ownerDocument) || document;

        var addAttr = function (el, obj) {
            for (var attr in obj) {
                switch (attr) {
                    case 'tag' :
                        break;
                    case 'html' :
                        el.innerHTML = obj[attr];
                        break;
                    case 'css' :
                        for (var style in obj.css) {
                            $.style(el, style, obj.css[style]);
                        }
                        break;
                    case 'text' :
                    case 'child' :
                    case 'children' :
                        createNode(obj[attr], el);
                        break;
                    case 'cls' :
                        el.className = obj[attr];
                        break;
                    case 'data' :
                        for (var data in obj.data) {
                            $.data(el, data, obj.data[data]);
                        }
                        break;
                    case 'checked':
                    case 'disabled':
                    case 'selected':
                        $.prop(el, attr, obj[attr]);
                        break;
                    default :
                        if (attr.indexOf("on") === 0 && acx.isFunction(obj[attr])) {
                            $.event.add(el, attr.substr(2), obj[attr]);
                        } else {
                            $.attr(el, attr, obj[attr]);
                        }
                }
            }
        };

        var createNode = function (obj, parent) {
            if (acx.isArray(obj) || (obj && obj.jquery && obj.length > 1)) {
                for (var ret = [], i = 0; i < obj.length; i++) {
                    var newNode = createNode(obj[i], parent);
                    if (newNode) {
                        ret.push(newNode);
                    }
                }
                return ret;
            }
            var el;
            if (typeof(obj) === 'string') {
                el = context.createTextNode(obj);
            } else if (!obj) {
                return undefined;
            } else if (obj.nodeType === 1) {
                el = obj;
            } else if (obj instanceof acx.ui.Widget) {
                el = obj.el[0];
            } else if (obj.jquery) {
                el = obj[0];
            } else {
                if (acx.browser.ie678 && obj.tag && obj.tag.match(/input|button/i)) {
                    el = context.createElement("<" + obj.tag + " type='" + obj.type + "' name='" + obj.name + "'" + (obj.checked ? " checked" : "") + ">");
                    delete obj.type;
                } else {
                    el = context.createElement(obj.tag || 'DIV');
                }
                addAttr(el, obj);
            }
            if (parent) {
                parent.appendChild(el);
            }
            return el;
        };

        return $(createNode(elementDef, parentNode));
    };

    /**
     * Alias jQuery's promise API
     */
    acx.Deferred = $.Deferred;
    acx.when = function () {
        return acx.isArray(arguments[0]) ?
            $.when.apply(null, arguments[0]) :
            $.when.apply(null, arguments);
    };

    /**
     * acx.ux namespace for interface enhancements
     * @namespace
     */
    acx.ux = {};

    /**
     * acx.ui namespace for widget components
     * @namespace
     */
    acx.ui = {};

    /**
     * acx.ut namespace for interface templates
     * @namespace
     */
    acx.ut = {};


    /**
     * a class for generating custom events in widgets
     */
    acx.ux.Observable = window.Class.extend((function () {
        function getObs(type) {
            return ( this.observers[type] || ( this.observers[type] = [] ) );
        }

        return {
            makeConfig: true,
            init: function () {
                this.observers = {};
                this.suspendEvents = false;

                var toLowerCase = function (a) {
                    return a.toLowerCase();
                };

                for (var opt in this.config) { // automatically install observers that are defined in the configuration
                    if (opt.indexOf('on') === 0) {
                        this.on(opt.substring(2).replace(/^[A-Z]/, toLowerCase), this.config[opt]);
                    }
                }
            },
            on: function (type, fn, params, thisp) { // on: synonymous with addEvent, addObserver, subscribe
                getObs.call(this, type).push({cb: fn, args: params || [], cx: thisp || this});
                return this; // make observable functions chainable
            },
            fire: function (type) { // fire: synonymous with fireEvent, observe, publish
                var params = Array.prototype.slice.call(arguments, 1);
                if (this.suspendEvents) {
                    return this;
                }
                var callObserver = function (eventName) {
                    getObs.call(this, eventName).slice().forEach(function (ob) {
                        ob.cb.apply(ob.cx, ob.args.concat(params));
                    });
                }.bind(this);
                callObserver(type);
                if (type.indexOf(".") > 0) {
                    callObserver(type.split(".")[0]);
                }
                return this; // make observable functions chainable
            },
            removeObserver: function (type, fn) {
                var obs = getObs.call(this, type);
                // remove specific function if fn parameter is specified
                if (fn) {
                    var index = obs.reduce(function (p, t, i) {
                        return (t.cb === fn) ? i : p;
                    }, -1);
                    if (index !== -1) {
                        obs.splice(index, 1);
                    }
                }
                // otherwise, remove all the observer of the specifying type
                else {
                    delete this.observers[type];
                }
                return this; // make observable functions chainable
            },
            hasObserver: function (type) {
                return !!getObs.call(this, type).length;
            }
        };
    })());

    /**
     * GAQ Wrapper Class
     */
    acx.ux.Tracker = acx.ux.Observable.extend({

        _EVENT_DEFAULTS: {
            category: undefined,
            action: undefined,
            data: undefined,
            trackUrl: false
        },

        init: function () {
            this._super();
            this._initQueue();
        },

        _initQueue: function () {
            if (this.config.googleAnalyticsQueue === undefined && top._gaq === undefined) {
                top._gaq = [];
            }
        },

        _pushToQueue: function (array) {
            // We retrieve a fresh reference each time since GA clobbers top._gaq
            var queue = this.config.googleAnalyticsQueue || top._gaq;
            queue.push(array);
        },

        _getPageUrl: function () {
            return top.frames.main !== undefined && top.frames.main.location !== undefined ? top.frames.main.location.href : location.href;
        },

        eventWithUrl: function (options) {
            options.data = this._getPageUrl();
            this.event(options);
        },

        prepopulatedEvent: function (category, data) {
            return function (options) {
                options.category = (category !== undefined) ? category : options.category;
                options.data = (data !== undefined) ? data : options.data;

                acx.track.event(options);
            };
        },

        event: function (options) {
            var event = acx.extend({}, this._EVENT_DEFAULTS, options), args = [event.category, event.action, event.data];
            this._pushToQueue(['_trackEvent'].concat(args));
        }
    });

    try {
        acx.track = top.acx && top.acx.track;
    } finally {
        acx.track =  acx.track || new acx.ux.Tracker();
    }
    /**
     * acx.models namespace for data models
     * @namespace
     */
    acx.models = {};

    /**
     * base class for all models
     * provides: management of data and its related change events in order to drive views
     * @constructor
     */
    acx.models.Model = acx.ux.Observable.extend({
        defaults: {
            data: null
        },

        _fieldValidationDefaults: {
            mandatory: false,
            maxLength: undefined,
            regex: /.*/,
            onValidateField: undefined,
            onValidateModel: function (validIf) {
                validIf(true);
            }
        },

        init: function () {
            this._super();
            this._values = acx.extend({}, this.config.data);

            this._validationIndex = -1;

            this._pendingValidateFieldDeferreds = {};
            this._onValidateFieldResultsCache = {};
        },

        fields: function () {
            return {};
        },

        set: function (key, value, isPrepopulated) {
            if (this._values[key] === value) {
                return;
            }
            this._values[key] = value;
            if (!isPrepopulated) {
                this.fire("change." + key);
                return this.validate(key, value);
            }
        },

        get: function (key) {
            return this._values[key];
        },

        validate: function (sourceKey, sourceValue) {
            if (this.fields() === undefined) {
                return;
            }

            return this._generateValidationPromise(sourceKey, sourceValue);
        },

        _generateValidationPromise: function (sourceKey, sourceValue) {
            var validationIndex = this._validationIndex, validationPromise, fieldValidationPromises;

            if (sourceKey === undefined) {
                this.fire('validate');
            }

            if (this._hasPendingValidationPromise(sourceKey)) {
                validationPromise = this._pendingValidationPromise;
            } else {
                validationIndex = this._validationIndex = this._validationIndex + 1;

                fieldValidationPromises = this._generateAllFieldValidationPromises(validationIndex, sourceKey, sourceValue);

                validationPromise = acx.when(fieldValidationPromises);
            }

            this._pendingValidationPromise = validationPromise;

            validationPromise = this._bindEventsToValidationPromise(validationPromise, validationIndex);

            return validationPromise;
        },

        _hasPendingValidationPromise: function (sourceKey) {
            return (sourceKey === undefined &&
                this._pendingValidationPromise !== undefined &&
                this._pendingValidationPromise.state() === 'pending');
        },

        _generateAllFieldValidationPromises: function (validationIndex, sourceKey, sourceValue) {
            var fieldValidationPromises = [], fields = this.fields();

            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    fieldValidationPromises.push(this._generateFieldValidationPromise(validationIndex, key, sourceKey, sourceValue));
                }
            }

            return fieldValidationPromises;
        },

        _bindEventsToValidationPromise: function (validationPromise, validationIndex) {
            var fireValidEvent = function () {
                if (validationIndex === this._validationIndex) {
                    this.fire('valid');
                }
            }.bind(this), fireInvalidEvent = function () {
                if (validationIndex === this._validationIndex) {
                    this.fire('invalid');
                }
            }.bind(this), deletePendingValidationPromise = function () {
                delete this._pendingValidationPromise;
            }.bind(this);

            return validationPromise.done(fireValidEvent).fail(fireInvalidEvent).always(deletePendingValidationPromise);
        },

        _generateFieldValidationPromise: function (validationIndex, key, sourceKey, sourceValue) {
            var fields = this.fields();

            if (fields === undefined || fields[key] === undefined) {
                return;
            }

            this.fire('validatefield.' + key);

            var fieldValidationDeferred = new acx.Deferred(),
                fieldSpec = this._getFieldSpec(key),
                value = this.get(key) || '',
                isBlank = function () {
                    return value === undefined ||
                        (value.trim && value.trim() === '') ||
                        value.length === 0;
                },
                isBlankAndNotMandatory = function () {
                    return !fieldSpec.mandatory && isBlank();
                },
                failsMandatory = function () {
                    if (fieldSpec.mandatory && isBlank()) {
                        return 'mandatory';
                    }
                },
                failsMaxlength = function () {
                    if (fieldSpec.maxLength !== undefined && value.length > fieldSpec.maxLength) {
                        return 'maxlength';
                    }
                },
                failsRegex = function () {
                    if (!fieldSpec.regex.test(value)) {
                        return 'regex';
                    }
                },
                rejectionReason = failsMandatory() || failsMaxlength() || failsRegex();

            if (isBlankAndNotMandatory()) {
                fieldValidationDeferred.resolve();
            }
            else if (rejectionReason) {
                fieldValidationDeferred.reject(rejectionReason);
            }
            else {
                fieldValidationDeferred = this._attachFieldValidationFunctionsToDeferred(fieldValidationDeferred, fieldSpec, key, sourceKey, sourceValue);
            }

            fieldValidationDeferred = this._bindFieldValidationEventsToDeferred(fieldValidationDeferred, validationIndex, key);

            return fieldValidationDeferred.promise();
        },

        _attachFieldValidationFunctionsToDeferred: function (fieldDeferred, fieldSpec, key, sourceKey, sourceValue) {
            var onValidateFieldDeferred = this._generateOnValidateFieldDeferred(fieldSpec.onValidateField, key, sourceKey, sourceValue),
                onValidateModelDeferred = this._generateOnValidateModelDeferred(fieldSpec.onValidateModel, sourceKey, sourceValue);

            acx.when(onValidateFieldDeferred, onValidateModelDeferred).done(
                function () {
                    fieldDeferred.resolve();
                }).fail(function () {
                    fieldDeferred.reject();
                });

            return fieldDeferred;
        },

        _bindFieldValidationEventsToDeferred: function (fieldValidationDeferred, validationIndex, key) {
            var jEv = {}, fireValidEvent = function () {
                if (validationIndex === this._validationIndex) {
                    this.fire('validfield.' + key, jEv);
                }
            }.bind(this), fireInvalidEvent = function (reason) {
                if (validationIndex === this._validationIndex) {
                    jEv.reason = reason;
                    jEv.errorMessage = this.fields()[key].errorMessage;

                    this.fire('invalidfield.' + key, jEv);
                }
            }.bind(this);

            return fieldValidationDeferred.done(fireValidEvent).fail(fireInvalidEvent);
        },

        _generateOnValidateFieldDeferred: function (onValidateField, key, sourceKey, sourceValue) {
            var onValidateFieldDeferred = new acx.Deferred(),
                isValidatingChangedField = (key === sourceKey);

            if (!acx.isFunction(onValidateField)) {
                return onValidateFieldDeferred.resolve();
            }

            onValidateFieldDeferred = (isValidatingChangedField ?
                this._runOnValidateFieldFunction(onValidateFieldDeferred, onValidateField, sourceKey, sourceValue) :
                this._getExistingFieldDeferred(onValidateFieldDeferred, onValidateField, key));

            return onValidateFieldDeferred;
        },

        _runOnValidateFieldFunction: function (validateFieldDeferred, onValidateField, sourceKey, sourceValue) {
            var pendingFieldKey = sourceKey + '_' + sourceValue,
                pendingValidateFieldDeferred = this._pendingValidateFieldDeferreds[pendingFieldKey],
                hasPendingFieldDeferred = (pendingValidateFieldDeferred !== undefined),
                jEv;

            if (!hasPendingFieldDeferred) {
                this._pendingValidateFieldDeferreds[pendingFieldKey] = validateFieldDeferred;

                validateFieldDeferred.always(function () {
                    delete this._pendingValidateFieldDeferreds[pendingFieldKey];
                }.bind(this));

                jEv = {
                    model: this,
                    value: sourceValue
                };

                onValidateField(function (isValid) {
                    this._onValidateFieldResultsCache[sourceKey] = (isValid ? 'resolve' : 'reject');
                    validateFieldDeferred[isValid ? 'resolve' : 'reject']();
                }.bind(this), jEv);
            } else {
                validateFieldDeferred = pendingValidateFieldDeferred;
            }

            return validateFieldDeferred;
        },

        _getExistingFieldDeferred: function (validateFieldDeferred, onValidateField, key) {
            var pendingFieldDeferred = this._pendingValidateFieldDeferreds[key + '_' + this._values[key]];

            if (!pendingFieldDeferred) {
                if (this._onValidateFieldResultsCache[key]) {
                    return validateFieldDeferred[this._onValidateFieldResultsCache[key]]();
                }

                return this._runOnValidateFieldFunction(validateFieldDeferred, onValidateField, key, this._values[key]);
            }
            return pendingFieldDeferred;
        },

        _generateOnValidateModelDeferred: function (onValidateModel, sourceKey, sourceValue) {
            var onValidateModelDeferred = new acx.Deferred(), jEv = {
                model: this,
                sourceKey: sourceKey,
                sourceValue: sourceValue
            };

            onValidateModel(function (isValid) {
                onValidateModelDeferred[isValid ? 'resolve' : 'reject']();
            }, jEv);

            return onValidateModelDeferred;
        },

        _getFieldSpec: function (key) {
            return acx.extend({}, this._fieldValidationDefaults, this.fields()[key]);
        },

        val: function () {
            return acx.extend(true, {}, this._values);
        }

    });


    /**
     * base class for all widgets
     * provides: base element definition, automatic observable creation, bound function handlers
     * @constructor
     */
    acx.ui.Widget = acx.ux.Observable.extend({
        defaults: {
            id: null     // the id of the widget
        },
        _id: 'Widget',  // so we know what object we are looking at when debugging

        el: null,       // this is the jquery wrapped dom element(s) that is the actual widget

        init: function () {
            this._super();
            for (var prop in this) {       // automatically bind all the event handlers
                if (prop.contains("_handler")) {
                    this[prop] = this[prop].bind(this);
                }
            }
        },

        id: function (suffix) {
            return this.config.id ? (this.config.id + (suffix ? "-" + suffix : "")) : undefined;
        },

        appendTo: function (node) {
            this.el.appendTo(node);
            return this;
        },

        remove: function () {
            this.el.remove();
            return this;
        }
    });

    /**
     *
     * acx.views namespace for all views
     * @namespace
     */
    acx.views = {};

    /**
     * base class for all views
     * provides: support for models, optional two-way binding of values between view and model field
     * @constructor
     */
    acx.views.View = acx.ui.Widget.extend({
        defaults: {
            model: null,     // the instance of the acx.models.Model controlling the widget's value
            modelField: null // the key of the field within the model that the widget is to update
        },

        init: function () {
            this._super();

            if (this.config.model) {
                this.model = this.config.model;
                if (this.config.modelField) {
                    this.modelField = this.config.modelField;
                    this.model.on("change." + this.modelField, this._updateView.bind(this));
                    this.on("change", this._updateModel.bind(this));
                }
            }
        },

        val: $.noop,

        _updateModel: function () {
            this.model.set(this.modelField, this.val());
        },

        _updateView: function () {
            this.val(this.model.get(this.modelField));
        }
    });

    /**
     * Provides drag and drop functionality<br>
     * a DragDrop instance is created for each usage pattern and then used over and over again<br>
     * first a dragObj is defined - this is the jquery node that will be dragged around<br>
     * second, the event callbacks are defined - these allow you control the ui during dragging and run functions when successfully dropping<br>
     * thirdly drop targets are defined - this is a list of DOM nodes, the constructor works in one of two modes:
     * <li>without targets - objects can be picked up and dragged around, dragStart and dragStop events fire</li>
     * <li>with targets - as objects are dragged over targets dragOver, dragOut and DragDrop events fire
     * to start dragging call the DragDrop.pickup_handler() function, dragging stops when the mouse is released.
     * @constructor
     * @param options
     * The following options are supported
     * <dt>targetSelector</dt>
     *   <dd>an argument passed directly to jquery to create a list of targets, as such it can be a CSS style selector, or an array of DOM nodes<br>if target selector is null the DragDrop does Drag only and will not fire dragOver dragOut and dragDrop events</dd>
     * <dt>pickupSelector</dt>
     *   <dd>a jquery selector. The pickup_handler is automatically bound to matched elements (eg clicking on these elements starts the drag). if pickupSelector is null, the pickup_handler must be manually bound <code>$(el).bind("mousedown", dragdrop.pickup_handler)</code></dd>
     * <dt>dragObj</dt>
     *   <dd>the jQuery element to drag around when pickup is called. If not defined, dragObj must be set in onDragStart</dd>
     * <dt>draggingClass</dt>
     *   <dd>the class(es) added to items when they are being dragged</dd>
     * The following observables are supported
     * <dt>dragStart</dt>
     *   <dd>a callback when start to drag<br><code>function(jEv)</code></dd>
     * <dt>dragOver</dt>
     *   <dd>a callback when we drag into a target<br><code>function(jEl)</code></dd>
     * <dt>dragOut</dt>
     *   <dd>a callback when we drag out of a target, or when we drop over a target<br><code>function(jEl)</code></dd>
     * <dt>dragDrop</dt>
     *   <dd>a callback when we drop on a target<br><code>function(jEl)</code></dd>
     * <dt>dragStop</dt>
     *   <dd>a callback when we stop dragging<br><code>function(jEv)</code></dd>
     */
    acx.ux.DragDrop = acx.ux.Observable.extend({
        defaults: {
            targetsSelector: null,
            pickupSelector: null,
            dragObj: null,
            draggingClass: "dragging",
            proximity: null,
            leftMouseOnly: false,
            sortable: false,
            verticalOnly: false
        },

        init: function (options) {
            this._super(); // call the widget initialiser

            this.drag_handler = this.drag.bind(this);
            this.drop_handler = this.drop.bind(this);
            this.pickup_handler = this.pickup.bind(this);
            if (this.config.proximity) {
                this.proximity_handler = this.proximity.bind(this);
            }
            this.targets = [];
            this.dragObj = null;
            this.dragObjOffset = null;
            this.currentTarget = null;
            if (this.config.pickupSelector) {
                $(this.config.pickupSelector).bind("mousedown", function (jEv) {
                    if (this.config.proximity) {
                        this.initCur = jEv.vMouse();
                        $(document).bind("mousemove", this.proximity_handler);
                        var unbindProximityMouseEvs = function () {
                            $(document).unbind("mousemove", this.proximity_handler);
                            $(document).unbind("mouseup", unbindProximityMouseEvs);
                        }.bind(this);
                        $(document).bind("mouseup", unbindProximityMouseEvs);
                    } else {
                        this.pickup_handler(jEv);
                    }
                }.bind(this));
            }
        },

        proximity: function (jEv) {
            if (jEv.pageX >= (this.initCur.x + this.config.proximity) ||
                jEv.pageX <= (this.initCur.x + this.config.proximity) ||
                jEv.pageY >= (this.initCur.y + this.config.proximity) ||
                jEv.pageY <= (this.initCur.y + this.config.proximity)) {
                $(document).unbind("mousemove", this.proximity_handler);
                this.pickup_handler(jEv);
                delete this.initCur;
            }
        },

        drag: function (jEv) {
            jEv.preventDefault();
            var mloc = acx.vector(jEv.pageX, jEv.pageY);
            this.dragObj.css({
                top: mloc.add(this.dragObjOffset).asOffset().top,
                left: this.config.verticalOnly && this.dragObj ? this.dragObj.offset().left : mloc.add(this.dragObjOffset).asOffset().left
            });
            if (this.targets.length === 0) {
                return;
            }
            if (this.currentTarget !== null && mloc.within(this.currentTarget[1], this.currentTarget[2])) {
                return;
            }
            if (this.currentTarget !== null) {
                this.fire('dragOut', this.currentTarget[0]);
                this.currentTarget = null;
            }
            for (var i = 0; i < this.targets.length; i++) {
                if (mloc.within(this.targets[i][1], this.targets[i][2])) {
                    this.currentTarget = this.targets[i];
                    break;
                }
            }
            if (this.currentTarget !== null) {
                this.fire('dragOver', this.currentTarget[0], {isLastTarget: this.currentTarget[3]});
            }
        },

        drop: function (jEv) {
            $(document).unbind("mousemove", this.drag_handler);
            $(document).unbind("mouseup", this.drop_handler);
            this.dragObj.removeClass(this.config.draggingClass);
            if (this.currentTarget !== null) {
                this.fire('dragOut', this.currentTarget[0]);
                this.fire('dragDrop', this.currentTarget[0], { isLastTarget: this.currentTarget[3], currentIndex: this.dragObj.data("index"), targetIndex: this.currentTarget[0].data("index") });
            }
            this.fire('dragStop', jEv);
            this.dragObj = null;
        },

        pickup: function (jEv, opts) {
            if (this.config.leftMouseOnly && jEv.which !== 1) {
                return false;
            }
            acx.extend(this.config, opts);
            this.fire('dragStart', jEv);
            this.dragObj = this.dragObj || this.config.dragObj;
            this.dragObjOffset = this.config.dragObjOffset || acx.vector(this.dragObj.offset()).sub(jEv.pageX, jEv.pageY);
            this.dragObj.addClass(this.config.draggingClass);
            if (!this.dragObj.get(0).parentNode || this.dragObj.get(0).parentNode.nodeType === 11) { // 11 = document fragment
                $(document.body).append(this.dragObj);
            }
            if (this.config.targetsSelector) {
                this.currentTarget = null;
                var targets = ( this.targets = [] ), lastBottom = 0, jTargets = $(this.config.targetsSelector), numTargets = jTargets.length;
                // create an array of elements optimised for rapid collision detection calculation
                jTargets.each(function (i, el) {
                    var jEl = $(el), tl = 0, br = 0, halfHeight;
                    if (this.config.sortable) {
                        jEl.data("index", i);
                        tl = acx.vector(jEl.offset().left, lastBottom);
                        halfHeight = jEl.offset().top + (jEl[0].offsetHeight / 2);
                        br = acx.vector(jEl.offset().left + jEl[0].offsetWidth, halfHeight);
                    } else {
                        tl = acx.vector(jEl.offset());
                        br = tl.add(jEl.width(), jEl.height());
                    }
                    targets.push([jEl, tl, br]);
                    lastBottom = halfHeight;
                    if (this.config.sortable && (numTargets - 1) === i) {
                        tl = acx.vector(jEl.offset().left, lastBottom);
                        br = acx.vector(jEl.offset().left + jEl[0].offsetWidth, (jEl.offset().top + jEl[0].offsetHeight + this.dragObj[0].offsetHeight));
                        targets.push([jEl, tl, br, true]);
                    }
                }.bind(this));
            }
            $(document).bind("mousemove", this.drag_handler);
            $(document).bind("mouseup", this.drop_handler);
            this.drag_handler(jEv);
        }
    });

    /*
     * Loading frame helper functions for abstracting cross-frameset interactions.
     */
    acx.loader = {};

    acx.loader.show = function () {
        top.loadingFrame && top.loadingFrame.show.apply(top.loadingFrame, Array.prototype.slice.call(arguments, 0));
    };
    acx.loader.hide = function () {
        top.loadingFrame && top.loadingFrame.hide();
    };
    acx.loader.preventAutoHide = function () {
        top.loadingFrame && top.loadingFrame.preventAutoHide();
    };
    acx.loader.isVisible = function () {
        return top.loadingFrame && top.loadingFrame.el.is(':visible');
    };

    /*
     * Namespace for holding all ids related to user session, eg. project, org, user etc.
     */
    acx.session = {};

    acx.session.getProjectName = function () {
        return top.mainMenu ? top.mainMenu.getProjectName() : null;
    };
    acx.session.getProjectId = function () {
        return top.mainMenu ? top.mainMenu.getProjectId() : null;
    };
    acx.session.setProjectId = function (projectId) {
        top.mainMenu && top.mainMenu.refreshNavAndProject(projectId);
    };
    acx.session.getUserId = function () {
        return top.mainMenu ? top.mainMenu.getUserId() : null;
    };
    acx.session.getLocale = function () {
        return top.mainMenu && top.mainMenu.getLocale();
    };
	acx.session.getOrganizationName = function () {
		return top.mainMenu ? top.mainMenu.getOrganizationName() : null;
	};
	acx.session.getJobTitle = function () {
		return top.mainMenu ? top.mainMenu.getJobTitle() : null;
	};


    /*
     * Shortcuts
     */

    /**
     * shortcut to {@link acx.i18n.formatKey}
     * @function
     */
    acx.text = acx.i18n.formatKey;

    /**
     * container for helper methods
     * @namespace
     */
    acx.helpers = {};

    /**
     * creates new namespace or passes reference if it already exists
     * @namespace
     */
    acx.namespace = function (namespace) {
        var obj = acx;
        namespace.split(".").forEach(function (name) {
            obj[name] = obj[name] || {};
            obj = obj[name];
        });
    };

    acx.getCookie = function (name) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].replace(/^\s+/, '');
            if (cookie.indexOf(name + '=') === 0) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    };

//Returns '/rsrc/XX.X.0-0-SNAPSHOT/xx_XX_DOC/'
    acx.getResourcePath = (function () {
        var resourcePathRegExp = /^\/rsrc\/.+?\/.+?\//, resourcePath = null;

        function getResourcePath(filePath) {
            if (resourcePathRegExp.test(getResourcePath.pathname)) {
                resourcePath = getResourcePath.pathname.match(resourcePathRegExp)[0];
            } else {
                $('link').each(function () {
                    var href = $(this).attr('href');
                    if (resourcePathRegExp.test(href)) {
                        resourcePath = href.match(resourcePathRegExp)[0];
                        return false;
                    }
                });
            }
            return resourcePath + (filePath || '');
        }

        // Alias location.href internally so it can be mocked out during testing
        getResourcePath.pathname = window.location.pathname;

        return getResourcePath;
    })();

    acx.sanitizeUrl = function (url, fallback) {
        var target = $.create({tag: "A", href: url})[0], currentDomain = location.protocol + "//" + location.host;

        return ((target.protocol === ':' && target.host === '') || target.href.indexOf(currentDomain) === 0 ? url : fallback || '/');
    };

// Ping Utilities - keep the session alive
    (function () {
        var target = {interval: 15 * 60 * 1000}; // 900000 default interval 15 minutes
        var ping = function () {
            acx.ajax({url: "/Ping", data: "IS_AJAX_REQUEST=true"});
            setTimeout(ping, target.interval);
        };
        var start = function (opts) {
            target = acx.extend(target, opts);
            setTimeout(ping, target.interval);
        };
        acx.PingUtils = {start: start};
    })();


})();