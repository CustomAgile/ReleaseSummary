function ReleaseSummary() {
    var that = this;
    var rallyDataSource = new rally.sdk.data.RallyDataSource('__WORKSPACE_OID__',
            '__PROJECT_OID__',
            '__PROJECT_SCOPING_UP__',
            '__PROJECT_SCOPING_DOWN__');
    var releaseDropdown;
    var releaseNotesDiv;
    var wait;
    var loadingSpan;

    this._renderReleaseNotes = function(items) {
        if (wait) {
            wait.hide();
            wait = null;
        }

        var notesHeader = dojo.create('div', {'class': 'notesHeader'}, releaseNotesDiv);
        notesHeader.appendChild(document.createTextNode("About this release:"));

        if (items.release && items.release.length > 0 && items.release[0].Notes) {
            //use innerhtml so it will render html characters
            dojo.create('div', {'class': 'notes', innerHTML: items.release[0].Notes}, releaseNotesDiv);
        }

        var additionalInfo = dojo.create('div', {'class': 'additionalInfo'}, releaseNotesDiv);
        additionalInfo.appendChild(document.createTextNode("Additional information is available "));
        var releaseLink = new rally.sdk.ui.basic.Link({item: releaseDropdown.getSelectedItem(), text: "here"});
        releaseLink.display(additionalInfo);
        additionalInfo.appendChild(document.createTextNode("."));

        if (items.stories) {
            var storiesHeader = dojo.create('div', {'class': 'storiesHeader'}, releaseNotesDiv);
            storiesHeader.appendChild(document.createTextNode("Stories: " + items.stories.length));

            var stories = dojo.create('ul', {'class': 'storiesList'}, releaseNotesDiv);
            rally.forEach(items.stories, function(s) {
                var li = dojo.create('li', {'class': 'story'}, stories);
                var link = new rally.sdk.ui.basic.Link({item: s});
                link.display(li);
                dojo.create('span', {innerHTML: " - " + s.Name}, li);
            });
        }

        if (items.defects) {
            var defectsHeader = dojo.create('div', {'class': 'defectsHeader'}, releaseNotesDiv);
            defectsHeader.appendChild(document.createTextNode("Defects: " + items.defects.length));

            var defects = dojo.create('ul', {'class': 'defectsList'}, releaseNotesDiv);
            rally.forEach(items.defects, function(d) {
                var li = dojo.create('li', {'class': 'defect'}, defects);
                var link = new rally.sdk.ui.basic.Link({item: d});
                link.display(li);
                dojo.create('span', {innerHTML: " - " + d.Name}, li);
            });
        }
    };

    this._queryForItems = function() {
        dojo.empty(releaseNotesDiv);
        wait = new rally.sdk.ui.basic.Wait({});
        wait.display(loadingSpan);

        var query = new rally.sdk.util.Query("ScheduleState = Accepted");
        if (releaseDropdown.getQueryFromSelected()) {
            query = query.and(releaseDropdown.getQueryFromSelected());
        }
        rallyDataSource.findAll([
            {
                key: "stories",
                type: "hierarchicalrequirement",
                query: query,
                fetch: "FormattedID,Name",
                order: "ObjectID"
            },
            {
                key: "defects",
                type: "defect",
                query: query,
                fetch: "FormattedID,Name",
                order: "ObjectID"
            },
            {
                key: "release",
                type: "release",
                fetch: "Notes",
                query: new rally.sdk.util.Query("ObjectID = " + rally.sdk.util.Ref.getOidFromRef(releaseDropdown.getSelectedItem()))
            }
        ], that._renderReleaseNotes);

    };

    this._createLayout = function(element) {
        var headerDiv = dojo.create('div', {'class': 'header'}, element);
        var dropdownContainerSpan = dojo.create('span', {'class': 'dropdownContainer'}, headerDiv);

        loadingSpan = dojo.create('span', {'class': 'loading'}, headerDiv);
        //IE7 requires child content to display wait/span correctly
        loadingSpan.appendChild(document.createTextNode(" "));

        releaseNotesDiv = dojo.create('div', {'class': 'releaseNotes'}, element);

        //Create dropdowns
        var dropdownConfig = {
            showLabel: true,
            label: "Release: "
        };
        releaseDropdown = new rally.sdk.ui.ReleaseDropdown(dropdownConfig, rallyDataSource);
        releaseDropdown.display(dropdownContainerSpan, that._queryForItems);
    };

    this.display = function(element) {

        rally.sdk.ui.AppHeader.setHelpTopic("247");
        rally.sdk.ui.AppHeader.showPageTools(true);

        //Build app layout
        that._createLayout(element);
    };
}