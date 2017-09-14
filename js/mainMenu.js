acx.menu = {};

acx.menu.LoadingBlocker = acx.ui.LoadingBlocker.extend({
    _id: "LoadingBlocker",

    init: function(parent) {
        this._super(parent);
        this._autoHide = true;
    },

    hide: function(speed, fn) {
        this._super(speed, fn);
        this._autoHide = true;
    },

    preventAutoHide: function() {
        this._autoHide = false;
    },

    _finishedLoading_handler: function() {
        if (!this._autoHide) {
            return false;
        } else {
            this._super();
        }
    }
});

acx.menu.ProjectChanger = acx.ui.Widget.extend({
    _id: "ProjectChanger",

    init: function(parent) {
        this._super();

        this.currentProject = this.config.currentProject || null;
        this.currentProjectId = this.currentProject && this.currentProject.projectId;
        this.availableProjects = this.config.availableProjects;
        this.projectPanel = new acx.menu.ProjectsPanel({ body: this.availableProjects.map(this._projectListItem_template, this) });

        this.el = !acx.isEmpty(this.currentProject) && $.create(this._main_template());

        if (parent && this.el) {
            this.el.appendTo(parent);
        }
    },

    setProject: function(id) {
        if (id) {
            for (var p = 0; p < this.availableProjects.length; p++) {
                if (this.availableProjects[p].projectId.toString() === id.toString()) {
                    if (this.currentProject.projectRegType !== this.availableProjects[p].projectRegType) {
                        this.fire("projectRegTypeMismatch", this);
                    }
                    this.currentProject = this.availableProjects[p];
                    this.el.find("#projectChanger-name").empty().append($.create(this._projectName_template(this.currentProject)));
                    this.currentProjectId = this.currentProject.projectId;
                    return;
                }
            }
            this.fire("projectNotInList", this);
        }
    },

    _openProjectList_handler: function(jEv) {
        if (! this.isListOpen) {
            this.isListOpen = true;
            this.projectPanel.open(jEv);
            this.projectPanel.el.addClass("projectChanger-overflow", this.projectPanel.el.height() > 300);

            var modal = $("#uiModal");
            this.lastOpacity = modal.css("opacity");
            modal.css({ opacity: "0" });
            var cx = this;
            setTimeout(function() {
                $(document).one("click", cx._closeProjectList_handler);
            }, 50);
        } else {
            this._closeProjectList_handler();
        }
    },

    _closeProjectList_handler: function(jEv) {
        this.isListOpen = false;
        $("#uiModal").css({ opacity: this.lastOpacity });
        this.projectPanel.close(jEv);
    },

    _changeProject: function(project) {
        this.fire("projectChange", this, project);
    },

    _isNotNormalAccessForProject: function(project) {
        return project.projectAccessLevel.value !== "NORMAL";
    },

    _projectName_template: function(project) {
        return { tag: "SPAN", text: project.projectShortName, child:
            (this._isNotNormalAccessForProject(project) ? { tag: "SPAN", cls: "hint", text: " - " + project.projectAccessLevel.name.toUpperCase() } : null)
        };
    },

    _projectListItem_template: function(project) {
        return { tag: "DIV",
            cls: "projectChanger-listItem",
            id: "projectChanger-" + project.projectId,
            onclick: function() {
                this._changeProject(project);
            }.bind(this),
            child: this._projectName_template(project),
            title: project.projectName
        };
    },

    _main_template: function () { return (
        { tag: "SPAN", cls: "projectChanger-container", onclick: this._openProjectList_handler, children: [
            { tag: "SPAN", id: "projectChanger-name", cls: "projectChanger-project", child: this._projectName_template(this.currentProject) },
            { tag: "SPAN", cls: "projectChanger-arrow" }
        ]}
    ); }
});

acx.menu.ProjectsPanel = acx.ui.AbstractPanel.extend({
    _id: "ProjectsPanel",

    defaults: {
        zIndex: 1011
    },

    init: function() {
        this._super();
        this.el = $.create(this._main_template());
    },

    _getPosition: function() {
        return { top: 40, left: 169 };
    },

    _main_template: function() {
        return { tag: "DIV", cls: "uiPanel projectChanger-list", css: { display: "none" }, children: this.config.body };
    }
});

acx.menu.NavBarPanel = acx.ui.AbstractPanel.extend({
    _id: "NavBarPanel",
    defaults: {
        zIndex: 1005
    },

    init: function() {
        this._super();
        this.el = $.create(this._main_template());
    },

    _getPosition: function(jEv) {
        var button = $(jEv.target).closest("BUTTON");
        return (button.vOffset()
            .addX(acx.i18n.isRtl() ? button.outerWidth() - this.el.outerWidth() + 1 : -1)
            .addY(button.parents(".nav-barRow").outerHeight())
            .asOffset()
            );
    },

    _main_template: function() {
        return { tag: "DIV", cls: "navBarPanel", child: { tag: "DIV", cls: "navBarPanel-menu", children: this.config.body } };
    }
});

acx.menu.NavBarButton = acx.ui.Button.extend({
    _id: "NavBarButton",
    defaults: {
        targetFrame: window, // allow the menu to open in another frame
        module: null,        // the data to draw the module
        response: null,      // the data of the entire response
        icon: null           // the module icon
    },

    baseClass: "uiButton uiMenuButton navBarButton",

    init: function(parent) {
        this._super(parent);
        this.defaultMenu = this.config.module.menus.filter(function(menu) {
            return this.config.module.defaultKey === menu.key && menu;
        }, this)[0];
        this.el.bind("dblclick", this.openDefaultMenuItem.bind(this));
        this.el.bind("mouseenter", this._mouseenter_handler);
        this.panel = new acx.menu.NavBarPanel({
            body: this['_moduleMenuPanel_template_' + this.config.module.key](this.config.module, this.config.response)
        });
    },

    openPanel: function(jEv) {
        this.panel.open(jEv);
        this.el.addClass("open");

        try {
            if (this.config.targetFrame.onOpenMenuPanel) {
                this.config.targetFrame.onOpenMenuPanel(this);
            }
        }
        catch (err) {
            // RPT-1032 Temporary workaround to ignore Security Error due to Insights being on a subdomain
        }
    },

    closePanel: function() {
        this.panel.close();
        this.el.removeClass("open");

        try {
            if (this.config.targetFrame.onCloseMenuPanel) {
                this.config.targetFrame.onCloseMenuPanel(this);
            }
        }
        catch (err) {
            // RPT-1032 Temporary workaround to ignore Security Error due to Insights being on a subdomain
        }
    },

    openMenuItem: function(menuItem, jEv) {
        if (menuItem.url.match(/^https?\:\/\//)) {
            window.open(menuItem.url).focus();
        } else {
            this.fire("openMenuItem", this, { menuItem: menuItem, source: jEv });
            var menuUrl = menuItem.url;
            if (acx.session.getProjectId()) {
                menuUrl = menuUrl + (menuUrl.contains("?") ? "&" : "?") + "projectId=" + acx.session.getProjectId();
            }
            this.config.targetFrame.location.href = menuUrl;
        }
    },

    _mouseenter_handler: function(jEv) {
        this.fire("enter", this, { event: jEv});
    },

    _openMenuItem_handler: function(jEv) {
        var menuItem = $(jEv.target).data("menuItem");

        acx.track.event({
          action: 'Mega menu item clicked',
          category: 'Navigation',
          data: menuItem.key
        });

        this.openMenuItem(menuItem, jEv);
    },

    openDefaultMenuItem: function(jEv) {
        acx.track.event({
          action: 'Main menu item double clicked',
          category: 'Navigation',
          data: this.defaultMenu ? this.defaultMenu.key : 'No default menu'
        });

        this.defaultMenu && this.openMenuItem(this.defaultMenu, jEv);
    },

    _moduleMenuPanel_template_TASK: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['TASK-VIEWSUM'], "MainMenu.Sub.View"),
                this._subgroup_template(module, ['TASK-DASHBOARD', 'TASK-NEWREM', 'TASK-SEARCH'], "MainMenu.Sub.Actions")
            ])
        ];
    },

    _moduleMenuPanel_template_DOC: function(module, response) {
        return [
            this._column_template([
                this._subgroup_template(module, ['DOC-SEARCH', 'DOC-UNREG'], "MainMenu.Sub.Search"),
                this._subgroup_template(module, ['DOC-NEW', 'DOC-BULKUP' , 'DOC-BULKIMPORT', 'DOC-PRINT', 'DOC-FOLDER'], "MainMenu.Sub.Actions")
            ]),
            this._column_template([
                this._moduleMenuPanel_template_SavedSearches(response.SAVED_SEARCHES.modules.DOCUMENTS)
            ])
        ];
    },

    _moduleMenuPanel_template_CORRESPONDENCE: function(module, response) {
        var topCorrTypes = { menus: [], keys: [] }, topCorrTypes_template = null;
        if (!acx.isEmpty(response.TOP_CORR_TYPES)) {
            response.TOP_CORR_TYPES.forEach(function(el, i) {
                return topCorrTypes.keys.push(el.key);
            });
            topCorrTypes.menus = response.TOP_CORR_TYPES;

            topCorrTypes_template = [
                this._subgroup_template(topCorrTypes, topCorrTypes.keys, "MainMenu.Sub.CreateNew", "MainMenu.Sub.YourCommonlyUsedMailTypes"),
                { tag:"DIV", cls: "navBarPanel-menuSubSectionSubTitle", text: acx.text("MainMenu.Sub.Or") }
            ];
        }

        return [
            this._column_template([
                this._subgroup_template(module, ['CORRESPONDENCE-SEARCHINBOX', 'CORRESPONDENCE-SEARCHSENT', 'CORRESPONDENCE-SEARCHDRAFTS','CORRESPONDENCE-NEWSEARCHINBOX'], "MainMenu.Sub.Search"),
                topCorrTypes_template,
                this._subgroup_template(module, ['CORRESPONDENCE-CREATEMAIL'], (!acx.isEmpty(response.TOP_CORR_TYPES) ? null : "MainMenu.Sub.CreateNew")),
                this._subgroup_template(module, ['CORRESPONDENCE-REGINCOMING', 'CORRESPONDENCE-MAILAPPROVALS'], "MainMenu.Sub.Actions")
            ]),
            this._column_template([
                this._moduleMenuPanel_template_SavedSearches(response.SAVED_SEARCHES.modules.MAIL)
            ])
        ];
    },

    _savedSearchItem_template: function(savedSearch) {
        return { tag: "DIV",
            cls: "navBarPanel-menuItem",
            onclick: this._openMenuItem_handler,
            data: { menuItem: $.extend({key: this.config.module.key + '-SAVED-SEARCH-ITEM'}, savedSearch)},
            text: savedSearch.name
        };
    },

    _moduleMenuPanel_template_SavedSearches: function(savedSearches) {
        var ret = [];
        if (!savedSearches) {
            return;
        }
        for (var savedSearchType in savedSearches.groups) {
            var savedSearchCategory = savedSearches.groups[savedSearchType];
            var savedSearchList = savedSearchCategory.savedSearchDescriptions.map(this._savedSearchItem_template.bind(this));

            savedSearchCategory.moreUrl !== "" &&
            savedSearchList.push({ tag:"DIV", cls: "navBarPanel-menuSubSectionFooter", child:
            { tag: "SPAN", cls: "textlink", text: acx.text("MainMenu.Sub.More"), onclick: this._openMenuItem_handler,
                data: { menuItem: { url: savedSearchCategory.moreUrl, key: this.config.module.key + '-SAVED-SEARCH-MORE' } } }
            });

            if (!acx.isEmpty(savedSearchList)) {
                ret.push({ tag: "DIV", id: this.id("SavedSearches"), cls: "navBarPanel-menuSubSection", children: [
                    { tag: "DIV", cls: "navBarPanel-menuSubSectionTitle", text: acx.text("MainMenu.Sub.SavedSearches." + savedSearchType) }
                ].concat(savedSearchList)});
            }
        }
        return ret.length > 0 ? ret : null;
    },

    _moduleMenuPanel_template_WORKFLOW: function(module, response) {
        return [
            this._column_template([
                this._subgroup_template(module, ['WORKFLOW-SEARCH', 'WORKFLOW-TEMPLATESEARCH'], "MainMenu.Sub.Search"),
                this._subgroup_template(module, ['WORKFLOW-NEWTEMPLATE'], "MainMenu.Sub.CreateNew")
            ]),
            this._column_template([
                this._moduleMenuPanel_template_SavedSearches(response.SAVED_SEARCHES.modules.WORKFLOWS)
            ])
        ];
    },

    _moduleMenuPanel_template_SUPPLIERDOCS: function(module, response) {
        return [
            this._column_template([
                this._subgroup_template(module, ['SUPPLIERDOCS-SEARCH', 'SUPPLIERDOCS-ACTIVEPKG', 'SUPPLIERDOCS-DRAFTPKG'], "MainMenu.Sub.Search"),
                this._subgroup_template(module, ['SUPPLIERDOCS-NEWPKG'], "MainMenu.Sub.CreateNew")
            ]),
            this._column_template([
                this._moduleMenuPanel_template_SavedSearches(response.SAVED_SEARCHES.modules.SUPPLIER_DOCUMENTS)
            ])
        ];
    },

    _moduleMenuPanel_template_TENDERS: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['NEWTENDER-ACTIVESEARCH', 'NEWTENDER-DRAFTSEARCH'], "MainMenu.Sub.Search"),
                this._subgroup_template(module, ['NEWTENDER-INVITE'], "MainMenu.Sub.CreateNew")
            ])
        ];
    },

    _moduleMenuPanel_template_SETUP: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['SETUP-PREFERENCES', 'SETUP-ROLESMEMBERS', 'SETUP-SECASSROLES'], "MainMenu.Sub.Configuration"),
                this._subgroup_template(module, ['SETUP-USERACCOUNT'], "MainMenu.Sub.User"),
                this._subgroup_template(module, ['SETUP-ORGACCOUNT', 'SETUP-USERLIST', 'SETUP-NEWORGMEMBER', 'SETUP-NEWORGGUEST'], "MainMenu.Sub.MyOrganisation")
            ]),
            this._column_template([
                this._subgroup_template(module, ['PROJECT-PROJSETTINGS', 'PROJECT-ALLPROJECTS', 'PROJECT-NEWPROJECT', 'PROJECT-CONFIGUREACCESSCONTROL', 'PROJECT-FORMMANAGEMENT', 'PROJECT-GROUPMANAGEMENT'], "MainMenu.Sub.Project"),
                this._subgroup_template(module, ['SETUP-ABOUT', 'SETUP-TERMS', 'SETUP-GLOBALPOLICIES', 'SETUP-3RDPARTYSW', 'SETUP-OTHERMODS'], "MainMenu.Sub.AboutAconex"),
                this._subgroup_template(module, ['SETUP-ADMINSEARCH', 'SETUP-ADMINNEWSEARCH', 'SETUP-ADMINTOOLS'], "MainMenu.Sub.Administration")
            ])
        ];
    },

    _moduleMenuPanel_template_DIR: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['DIR-PROJECT', 'DIR-GLOBAL'], "MainMenu.Sub.View")
            ])
        ];
    },

    _moduleMenuPanel_template_CONTRACT: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['CONTRACT-BUDGET', 'CONTRACT-VARIATIONS', 'CONTRACT-CONTRACTS', 'CONTRACT-REPORTS'], "MainMenu.Sub.View"),
                this._subgroup_template(module, ['CONTRACT-NEWCONTRACT', 'CONTRACT-BUDGETADJ', 'CONTRACT-VARIATIONREQUEST', 'CONTRACT-VARIATIONFORECAST'], "MainMenu.Sub.CreateNew")
            ])
        ];
    },

    _moduleMenuPanel_template_PRINTSHOP: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['PRINTSHOP-PRINTREQUESTS', 'PRINTSHOP-PRICES', 'PRINTSHOP-ACCOUNTS'], "MainMenu.Sub.Actions")
            ])
        ];
    },

	_moduleMenuPanel_template_PACKAGES: function(module) {
		return [
			this._column_template([
				this._subgroup_template(module, ['PACKAGES-SEARCH'], "MainMenu.Sub.Search"),
				this._subgroup_template(module, ['PACKAGES-NEW'], "MainMenu.Sub.Actions")
			])
		];
	},

	_moduleMenuPanel_template_BIM: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['BIM-MAIN', 'BIM-VIEW'], "MainMenu.Sub.View")
            ])
        ];
    },

    _moduleMenuPanel_template_REPORTING: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['REPORTING-MAIN', 'REPORTING-INSIGHTS-BETA', 'REPORTING-INSIGHTS', 'REPORTING-VIEW'], "MainMenu.Sub.View")
            ])
        ];
    },

    _moduleMenuPanel_template_COST: function(module) {
        return [
            this._column_template([
                this._subgroup_template(module, ['COST-MAIN', 'COST-VIEW', 'COST-ACTIVITY-STREAM', 'COST-REPORTS', 'COST-ADMINISTRATION'], "MainMenu.Sub.View")
            ])
        ];
    },

    _moduleMenuPanel_template_FIELD: function(module) {
        var origin = window.location.protocol + "//" + window.location.host;
        module.menus[0].url = origin + (module.menus[0].url).replace("{projectId}", acx.session.getProjectId() );
        return [
            this._column_template([
                this._subgroup_template(module, ['FIELD-MAIN', 'FIELD-VIEW'], "MainMenu.Sub.View")
            ])
        ];
    },

    _column_template: function(subGroups) {
        return (subGroups.reduce(function(ret, sg) {
            return ret || sg;
        }, false)) ? { tag: "DIV", cls: "navBarPanel-column", children: subGroups } : null;
    },

    _subgroup_template: function(module, keys, title, subTitle) {
        var menuItems = [];
        for (var k = 0; k < keys.length; k++) {
            for (var menus = module.menus, m = 0; m < menus.length; m++) {
                if (keys[k] === menus[m].key) {
                    menuItems.push(
                        { tag: "DIV", id: this.id(keys[k]), cls: "navBarPanel-menuItem", onclick: this._openMenuItem_handler, data: { menuItem: menus[m] }, text: acx.text("MainMenu." + keys[k]) || keys[k] }
                    );
                }
            }
        }
        if (menuItems.length === 0) {
            return null;
        } else {
            return { tag: "DIV", cls: "navBarPanel-menuSubSection", children: [
                !acx.isEmpty(title) ? { tag: "DIV", cls: "navBarPanel-menuSubSectionTitle", text: acx.text(title) } : null,
                !acx.isEmpty(subTitle) ? { tag:"DIV", cls: "navBarPanel-menuSubSectionSubTitle", text: acx.text(subTitle) } : null
            ].concat(menuItems)};
        }
    },

    button_template: function(config) {
        var btn = this._super(config);
        btn.child.child = acx.ut.buttonIcon(config.icon, btn.child.child);
        return btn;
    }
});

acx.menu.NavBar = acx.ui.Widget.extend({
    _id: "NavBar",
    defaults: {
        targetFrame: window, // the frame urls to target
        response: null       // the server response
    },

    init: function(parent) {
        this._super();
        this.buttons = this.config.response.NAV.modules.map(function(module) {
            return new acx.menu.NavBarButton({
                id: this.id(module.key),
                labelKey: "MainMenu." + module.displayNameKey,
                icon: module.key,
                targetFrame: this.config.targetFrame,
                module: module,
                response: this.config.response,
                onEnter: this._buttonEnter_handler,
                onClick: this._buttonClick_handler,
                onOpenMenuItem: this._openMenuItem_handler
            });
        }, this);
        this.activeButton = null;
        this.el = $.create(this._main_template());
        if (parent) {
            this.parent = parent;
            this.el.appendTo(parent);
            this.currentRow = 0;
            this.chevron = $.create(this._chevron_template());
            this.el.parent().prepend(this.chevron);
            this._chevrowResize_handler();
            $(window).bind("resize", this._chevrowResize_handler);
        }
    },

    openPanel: function(button, jEv) {
        button.openPanel(jEv);
        this.activeButton = button;
    },

    closePanel: function(button) {
        button.closePanel();
        this.activeButton = null;
    },

    destroy: function() {
        this.buttons && this.buttons.forEach(function(button) {
            button.panel.el.remove();
        });
        if (this.parent) {
            this.parent.empty();
        }
        $(window).unbind("resize", this._chevrowResize_handler);
        delete this.buttons;
    },

    navigateToLandingPage: function() {
        this.buttons.length > 0 && this.buttons[0].openDefaultMenuItem();
    },

    _chevrowResize_handler: function() {
        var rows = Math.round((this.buttons[this.buttons.length - 1].el.position().top - this.buttons[0].el.position().top) / 32) + 1;
        if (rows === this.rows) {
            return;
        }
        this.rows = rows;
        this.chevron[(this.rows > 1) ? "show" : "hide"]();
        this.currentRow = ( this.currentRow % this.rows ) - 1;
        this._chevrow_handler();
    },

    _chevrow_handler: function(jEv) {
        this.el.animate({ top: (-32 * (++this.currentRow % this.rows)) }, 150);
        this.chevron.toggleClass("navBar-chevronUp", (this.currentRow % this.rows) === (this.rows - 1));
    },

    _buttonClick_handler: function(jEv, button) {
        if (this.activeButton) {
            return;
        }
        jEv.stopPropagation();
        $(document).bind("click dblclick", this._closePanel_handler);
        this.openPanel(button, jEv);
    },

    _closePanel_handler: function(jEv) {
        if ($(jEv.target).closest(".navBarPanel").length === 0 ||
            $(jEv.target).closest(".navBarPanel-menuItem").length === 1 ||
            $(jEv.target).closest(".textlink").length === 1) {
            $(document).unbind("click dblclick", this._closePanel_handler);
            this.activeButton && this.closePanel(this.activeButton);
        }
    },

    _buttonEnter_handler: function(button, params) {
        if (this.activeButton && this.activeButton !== button) {
            this.closePanel(this.activeButton);
            this.openPanel(button, params.event);
        }
    },

    _openMenuItem_handler: function(button, params) {
        this.fire("openMenuItem", this, params);
        if (! params.menuItem.url.match(/\?.*moduleKey=/)) {
            var moduleKey = (params.menuItem.key && params.menuItem.key.split('-')[0] ) || button.config.module.key;
            params.menuItem.url = params.menuItem.url + (params.menuItem.url.match(/\?/) ? "&" : "?") + "moduleKey=" + moduleKey;
        }
        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].el.toggleClass("active", this.buttons[i] === button);
        }
    },

    _main_template: function() {
        return { tag: "DIV", id: this.id(), cls: "navBar", children: this.buttons };
    },

    _chevron_template: function() {
        return { tag: "DIV", cls: "navBar-chevron", title: acx.text("MainMenu.ChevronHelpText"), onclick: this._chevrow_handler };
    }
});

acx.menu.WalkMeHelpPanelItem = acx.ui.Widget.extend({
    init: function(parent) {
        this._super(parent);

        this.walkmeService = window.top.walkmeService;

        this.walkthrusContainer = $.create(this._walkthrus_container_template());
        this.el = $.create(this._content_template());

        if ( this.walkmeService ) {
            this._loadWalkthruList();
        }
    },

    _loadWalkthruList: function() {
        this.walkmeService.getWalkthrus(function(walkthrus) {
            this.walkthrusContainer.empty().append($.create(this._walkthrus_list_template(walkthrus)));
        }.bind(this));
    },

    _walkthruToLink: function(walkthru) {
        return {
            tag: "LI",
            css: { marginLeft: "-7px" },
            child: {
                tag: "A", css: {display: "block"},
                title: walkthru.Name,
                text: walkthru.Name,
                id: walkthru.Id,
                onclick: function() {
                    this.walkmeService.startWalkthruById(walkthru.Id, function() {
                        this.fire('startWalkthru');
                    }.bind(this));
                }.bind(this)
            }
        };
    },

    _walkthrus_list_template: function(walkthrus) {
        return {
            tag: "UL",
            cls: "list",
            css: { marginTop: "1px" },
            children: walkthrus.map(this._walkthruToLink.bind(this))
        };
    },

    _walkthrus_loading_template: function() {
        return {
            tag: "DIV",
            css: { padding: "6px 1px", verticalAlign: "top" },
            children: [
                {
                    tag: "IMG",
                    src: acx.getResourcePath('core/images/loading.gif'),
                    title: acx.text("MainMenu.HelpPanel.WalkMe.Loading"),
                    css: {margin: '0 10px 0 0'}
                },
                acx.text("MainMenu.Loading")
            ]
        };
    },

    _walkthrus_container_template: function() {
        return { tag: "DIV", id: "walkthrus_container", children: this._walkthrus_loading_template() };
    },

    _content_template: function() {
        return {
            tag: "DIV",
            cls: "helpPanel-item",
            children: [
                { tag: "B", text: acx.text("MainMenu.HelpPanel.WalkMe.Heading") },
                { tag: "BR" },
                this.walkthrusContainer
            ]
        };
    }
});

acx.menu.Nav = acx.ui.Widget.extend({
    _id: "Nav",
    defaults: {
        targetFrame: window,
        projectId: -1
    },
    init: function(parent) {
        this._super();
        this.xpsField = new acx.ui.TextField({
            name: "xpsField",
            onEnterPress: this.xpsSearch_handler,
            onIconClick: this.xpsSearch_handler,
            width: 200,
            icon: "search",
            hintText: acx.text("MainMenu.XPSHintText")
        });

        this.navBarRow = $.create(this._navBarRow_template());
        this.el = $.create(this._main_template());
        if (parent) {
            this.el.appendTo(parent);
        }
        this.loadNavData(["NAV", "USERINFO", "TOP_CORR_TYPES", "HELP", "SAVED_SEARCHES"], this.config.projectId);
    },

    loadNavData: function(data, projectId) {
        if (data.contains("NAV") && this.navBar) {
            this.navBar.destroy();
        }
        acx.ajax({
            url: "/Navigation",
            _action: "displayNavigation",
            viewName: "jsonView",
            projectId: projectId,
            data: data.map(
                function(d) {
                    return "navigationData=" + d;
                }).join("&"),
            onSuccess: this.renderData_handler
        });
    },

	reloadNavigation: function() {
		this.loadNavData(["NAV", "TOP_CORR_TYPES", "SAVED_SEARCHES"], this.config.projectId);
	},

    getProjectId: function() {
        if (this.projectChanger) {
            return this.projectChanger.currentProjectId;
        }
    },

    getProjectName: function() {
		if (this.projectChanger && this.projectChanger.currentProject) {
			return this.projectChanger.currentProject.projectName;
		} else {
			return "n/a";
		}
    },

    getUserId: function() {
        if(this._currentUserId) {
            return this._currentUserId;
        }
    },

    getUserFullName: function() {
        if(this._currentUserFullName) {
            return this._currentUserFullName;
        }
    },

    getOrganizationName: function() {
        if(this._organizationName) {
            return this._organizationName;
        }
    },

    getJobTitle: function() {
        if(this._jobTitle) {
            return this._jobTitle;
        }
    },

    getDateFormat: function() {
        return this.dateFormat;
    },

    getLocale: function() {
        return this._locale;
    },

    refreshNavAndProject: function(projectId) {
        if (this._hasProjectChanged(projectId)) {
            return;
        }

        this.fire("frameLoading", this);
        this.projectChanger.setProject(projectId);
        this._checkUserInfoContainerWidth();

        this.loadNavData(["NAV", "TOP_CORR_TYPES", "SAVED_SEARCHES"], projectId);
    },

    updateProjectListOrReloadAll: function(projectId) {
        if (!this._isValidProject(projectId) ||
            this._isChangingFromNoProjectToValidProject() ||
            !this._hasProjectChanged(projectId)) {
            this.fire("frameLoading", this);
            this.el.find(".nav-project").empty();
            this.projectChanger.projectPanel.el.remove();
            this.loadNavData(["NAV", "USERINFO", "TOP_CORR_TYPES", "SAVED_SEARCHES"], projectId);
        } else {
            this._refreshProjectList_handler();
        }
    },

    navigateToLandingPage: function() {
        this.navBar.navigateToLandingPage();
    },

	_pingSupportCentral: function() {
		if (this.config.supportCentralUrl) {
			acx.ajax({
				type: 'GET',
				url: this.config.supportCentralUrl,
				data: {
					userID: this.getUserId(),
					logonURL: 'https://' + window.top.location.host + '/Logon'
				},
				timeout: 2000,
				xhrFields: {
					withCredentials: true
				},
				onError: function() { return false; }
			});
		}
	},

	_getValidId: function(id) {
		return this._isValidProject(id) ? id.toString() : null;
	},

    _hasProjectChanged: function(projectId) {
		projectId = this._getValidId(projectId);
		var currentProjectId = this._getValidId(this.projectChanger && this.projectChanger.currentProjectId);
		return !currentProjectId || projectId === currentProjectId;
    },

    _isValidProject: function(projectId) {
        return !acx.isEmpty(projectId) && projectId > 0;
    },

    _isChangingFromNoProjectToValidProject: function() {
        return !this._isValidProject(this.projectChanger.currentProjectId);
    },

    _refreshProjectList_handler: function() {
        this.el.find(".nav-project").empty();
        this.projectChanger.projectPanel.el.remove();
        this.loadNavData(["USERINFO"]);
    },

    renderData_handler: function(response) {
        if (response.HELP) {
            this.help = response.HELP;
        }

		if (response.USERINFO) {
			this.projectChanger = new acx.menu.ProjectChanger(this.el.find(".nav-project"),
                { availableProjects: response.USERINFO.availableProjects,
                    currentProject: response.USERINFO.currentProject,
                    onProjectChange: this._projectChange_handler,
                    onProjectNotInList: this._refreshProjectList_handler,
                    onProjectRegTypeMismatch: this._reloadEntireFrame_handler }
            );
            this.el.find("SPAN.nav-orgDetails").attr("title", response.USERINFO.organizationName).text(response.USERINFO.organizationName);
            this.el.find("SPAN.nav-userDetails").attr("title", response.USERINFO.userName).text(response.USERINFO.userName);
            this.el.find(".nav-info, .nav-project").fadeIn(150);
            this.dateFormat = response.USERINFO.dateFormat;
            this._currentUserId = response.USERINFO.userId;
            this._currentUserFullName = response.USERINFO.userName;
			this._organizationName = response.USERINFO.organizationName;
			this._jobTitle = response.USERINFO.jobTitle;

            this._locale = response.USERINFO.locale;

            this._checkUserInfoContainerWidth();
			this._pingSupportCentral();
		}

        if(response.TOS) {
			var termsOfServiceIdToAccept = response.TOS.termsOfServiceIdToAccept;
			if (termsOfServiceIdToAccept) {
				$("#frameMain").attr("src", "/TermsOfService?_action=viewForAcceptance&termsOfServiceId=" + termsOfServiceIdToAccept);
				return;
			}
		}

        if (response.NAV) {
            this.navBar = new acx.menu.NavBar(this.navBarRow, {
                id: this.id("bar"),
                targetFrame: this.config.targetFrame,
                response: response,
                onOpenMenuItem: this._frameLoading_handler
            });
            this.navBar.el.hide().fadeIn(150);
        }

        this.fire("navLoaded", this);
    },

    _checkUserInfoContainerWidth: function() {
        var org = this.el.find("SPAN.nav-orgDetails"), user = this.el.find("SPAN.nav-userDetails"), info = this.el.find("#nav-info"), longest;
        org.text(org.attr("title"));
        user.text(user.attr("title"));

        if (info.offset().top > 0) {
            do {
                longest = org.text().length > user.text().length ? org : user;
                longest.text(longest.text().substr(0, longest.text().length - 2) + "\u2026");
            } while (info.offset().top > 0 && longest.text().length > 2);
        }
    },

    _navLoaded_handler: function() {
        $("#frameMain").attr("src", "/tasks/summary/features?_action=view");
        this.removeObserver("navLoaded", this._navLoaded_handler);
    },

    _projectChange_handler: function(projChanger, params) {
        this.fire("frameLoading", this, params);
        this.projectChanger.setProject(params.projectId);
        this._checkUserInfoContainerWidth();
        var isCallTargetFrameChangeProject = false;
        try {
            isCallTargetFrameChangeProject = acx.isFunction(this.config.targetFrame.changeProject);
        }
        catch (err) {
            // RPT-1032 Temporary workaround to ignore Security Error due to Insights being on a subdomain
        }

        if (isCallTargetFrameChangeProject) {
            var frame = $('#frameMain');
            frame.contents().find("INPUT[name=PROJECT_ID]").val(params.projectId);
            frame.one("load", function () {
                this.loadNavData(["NAV", "TOP_CORR_TYPES", "SAVED_SEARCHES"]);
            }.bind(this));

            this.config.targetFrame.changeProject();
        } else {
            this.on("navLoaded", this._navLoaded_handler);
            this.loadNavData(["NAV", "TOP_CORR_TYPES", "SAVED_SEARCHES"], params.projectId);
        }
    },

    openHelp_handler: function() {
        this.helpPanel = this.helpPanel || new acx.ui.HelpPanel({
            helpNumber: this.help.helpNumber,
            helpSearchUri: this.help.helpSearchUri,
            helpMessage: acx.text("MainMenu.HelpPanel.HelpForPage"),
            targetFrame: this.config.targetFrame,
            orgId: this.config.orgId
        });
        this.helpPanel.open();
    },

    xpsSearch_handler: function() {
        this.config.targetFrame.location.href = "/CrossProjectSearch?_action=display&viewName=xps/xps#query=" + encodeURIComponent(this.xpsField.val());
        this.xpsField.val("");
    },

    _frameLoading_handler: function(params) {
        this.fire("frameLoading", this, params);
    },

    _reloadEntireFrame_handler: function() {
        top.location.href = "/";
    },

    _logo_template: function() {
        return { tag: "SPAN", cls: "nav-logo", onclick: this.navigateToLandingPage.bind(this) };
    },

    _navBarRow_template: function() {
        return { tag: "DIV", cls: "nav-barRow" };
    },

    _main_template: function() {
        return (
        { tag: "DIV", id: this.id(), cls: "nav", children: [
            { tag: "DIV", cls: "nav-infoHolder", children: [
                { tag: "DIV", cls: "nav-extras", children: [
                    { tag: "SPAN", cls: "nav-xps", children: [
                        this.xpsField
                    ] },
                    { tag: "SPAN", cls: "nav-help textlink", onclick: this.openHelp_handler, children: [
                        { tag: "SPAN", text: acx.text("MainMenu.Help") }
                    ] }
                ] },
                this._logo_template(),
                { tag: "SPAN", cls: "nav-project", css: { display: "none" } },
                { tag: "SPAN", cls: "nav-info", id: "nav-info", css: { display: "none" }, children: [
                    { tag: "SPAN", cls: "nav-orgDetails" },
                    "\u2014",
                    { tag: "SPAN", cls: "nav-userDetails" },
                    { tag: "SPAN", children: [
                        { tag: "A", id: "logoff", href: "/Logon?Action=Logoff", target: "_top", text: acx.text("MainMenu.Logout") }
                    ]}
                ]}
            ] },
            this.navBarRow
        ]}
            );
    }
});
