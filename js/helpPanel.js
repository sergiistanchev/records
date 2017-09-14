acx.ui.HelpPanel = acx.ui.InfoPanel.extend({
    defaults: {
        titleText: acx.text("MainMenu.HelpPanelTitle"),
        width: 450,
        helpMessage: acx.text("MainMenu.HelpPanel.VisitSite"),
        helpSiteUri: "",   // (required) Help search url prefix
        targetFrame: window,
        zIndex: 1017,
        orgId: null,       // To display the list of org Admins in the panel
        orgAdminTitle: acx.text("MainMenu.HelpPanel.OrgAdmin.Title")
    },

    init: function(parent) {
        this.track = this.config.tracker || acx.track;

        this.walkmeService = window.top.walkmeService;

        this.config.width = this.walkmeService ? 780 : this.config.width;

        if ( this.walkmeService ) {
            this._setupWalkMe();
        }

        this._super(parent, acx.extend(this.config, {
            body: this._body_content_template()
        }));

        if (this.config.orgId) {
            var widget = this;
            widget._getOrgAdminsFor(widget.config.orgId, widget._setUpOrgAdminDetails.bind(this));
        }
        else {
            this.el.find('#orgAdminDetails').remove();
        }
    },

    _getOrgAdminsFor: function(organizationId, callback) {
		acx.ajax({
			type: "GET",
			url: "/internal/organizations/" + organizationId + "/orgAdmins",
			onSuccess: function(response) {
				callback(response);
			}
		});
	},

    _setupWalkMe: function() {
        this.walkMeHelpPanelItem = new acx.menu.WalkMeHelpPanelItem();

        this.walkMeHelpPanelItem.on('startWalkthru', function() {
            this.close();
        }.bind(this));
    },

    _walkme_panel_item_template: function() {
        return {
            tag: "DIV",
            css: {float:"left", width:"300px", marginLeft: "30px" },
            children: [
                this.walkMeHelpPanelItem
            ]
        };
    },

    _body_content_template: function() {
		var helpPageUri = window.top.mainMenu.help && window.top.mainMenu.help.helpPageUri;
        return {
            tag: "DIV", cls: "helpPanel", children: [
                { tag: "DIV", css: {float:"left", width:"410px"}, children:[

                    { tag: "DIV", cls: "helpPanel-item", children: [
                        { tag: "B", text: acx.text("MainMenu.HelpPanel.Search") },
						{ tag: "BR" },
						{
							tag: "A",
							href: helpPageUri,
							class: 'support-central-link',
							target: "_new",
							text: acx.text("MainMenu.HelpPanel.VisitSupportCentral"),
							onclick: this.supportCentralLinkClick_handler.bind(this)

						},
                        { tag: "BR" },
                        new acx.ui.TextField({
                            width: acx.browser.ie6 ? 395 : 400,
                            name: "q",
                            hintText: acx.text("MainMenu.HelpPanel.SearchHint"),
                            icon: "search",
                            onIconClick: this.helpSearch_handler.bind(this),
                            onEnterPress: this.helpSearch_handler.bind(this)
                        })
                    ]},

                    { tag: "DIV", id:"orgAdminDetails", cls: "helpPanel-item", children: [
                        {tag: 'B', text: this.config.orgAdminTitle},
                        {
                            tag: "DIV",
                            id: "orgAdminDetails-loading",
                            children: [
                                {
                                    tag: "IMG",
                                    src: acx.getResourcePath('core/images/loading.gif'),
                                    title: acx.text("MainMenu.Loading")
                                },
                                { tag: "DIV", text: acx.text("MainMenu.Loading") }
                            ]
                        },
                        { tag: "DIV", id: "orgAdminTableDiv"}
                    ]} ,

                    { tag: "DIV", cls: "helpPanel-item", css: {borderBottom: 'none'}, children: [
                        { tag: "B", text: acx.text("MainMenu.HelpPanel.Call") },
                        { tag: "BR" },
                        this.config.helpNumber || {
                            tag: "A",
                            href: this.config.callHelpdeskUrl,
                            target: "_new",
                            text: acx.text("MainMenu.HelpPanel.ContactUs")
                        }
                    ]}
                ]},
                this.walkmeService ? this._walkme_panel_item_template() : null
            ]
        };
    },

    _setUpOrgAdminDetails: function(response) {
        var orgAdminDIV = this.el.find('#orgAdminDetails'), loadingDiv = orgAdminDIV.find('#orgAdminDetails-loading'), container = orgAdminDIV.find('#orgAdminTableDiv'), panel = this;

        loadingDiv.remove();

        if (response.orgAdmins && response.orgAdmins.length > 0) {
            container
                .append($.create(this._generateTableWithOrgAdmins(response.orgAdmins)));

            if (response.totalNumberOfOrgAdmins && response.totalNumberOfOrgAdmins > 5) {
                container.append($.create({tag: 'DIV', cls: 'hint', text: acx.text("MainMenu.HelpPanel.OrgAdmin.Count", response.orgAdmins.length, response.totalNumberOfOrgAdmins)}));
            }
        }
        else {
            container
                .append($.create(this._generateTableWithNoOrgAdmins()));
        }

        container.slideDown('normal', function() {
            var isInViewPort = (panel.el.offset().left + panel.el.width()) > 0;
            if (panel.el.is(':visible') && isInViewPort) {
                panel.refreshPosition();
            }
        });
    },

    _generateTableWithOrgAdmins: function(orgAdmins) {
        var rowCells = function(orgAdmin) {
            return [
                { tag:'TD', text:orgAdmin.name },
                { tag:'TD', text:orgAdmin.city },
                { tag:'TD', text:orgAdmin.email }
            ];
        };

        var tableRows = function() {
            return orgAdmins.map(function(orgAdmin) {
                return { tag: 'TR', cls: "dataRow", children: rowCells(orgAdmin)};
            });
        };

        return {tag: 'TABLE', cls: 'dataTable', children: [
            { tag: 'TBODY', children: tableRows() }
        ]};
    },

    _generateTableWithNoOrgAdmins: function() {
        return {tag: 'TABLE', cls: 'dataTable', children: [
            { tag: 'TBODY', child: [
                { tag: 'TR', cls: 'dataRow', child: [
                    {tag: 'TD', cls: 'hint', html: acx.text("MainMenu.HelpPanel.OrgAdmin.NoOrgAdmin") }
                ]}
            ]}
        ]};
    },

	supportCentralLinkClick_handler: function(){
		this.track.event({
			category: 'Help',
			action: 'Help Panel - Link Clicked'
		});
	},

    helpSearch_handler: function(field) {
        var query = field.val();

        this.track.event({
            category: 'Help',
            action: 'Help Panel - Search triggered',
            data: query
        });

        this._searchSupportCentral(query);
    },

    _searchSupportCentral: function(query) {
        window.open(this.config.helpSearchUri + encodeURIComponent(query)).focus();
    },

    open: function() {
        this.track.eventWithUrl({ category: 'Help', action: 'Help Panel Displayed' });

        this._super();
    },

    close: function() {
        this.track.event({ category: 'Help', action: 'Help Panel Closed' });

        this._super();
    }
});
