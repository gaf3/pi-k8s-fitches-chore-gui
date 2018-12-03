window.DRApp = new DoTRoute.Application();

DRApp.load = function (name) {
    return $.ajax({url: name + ".html", async: false}).responseText;
}

DRApp.rest = function(type,url,data,success,error,complete) {

    var response = $.ajax({
        type: type,
        url: url,
        contentType: "application/json",
        data: (data === null) ? null : JSON.stringify(data),
        dataType: "json",
        success: success,
        error: error,
        complete: complete,
        async: (success != null || error != null || complete != null)
    });

    if (success != null || error != null || complete != null) {
        return;
    }

    //alert(response.status);

    if ((response.status != 200) && (response.status != 201) && (response.status != 202)) {
        throw new Exception(type + ": " + url + " failed",response);
    }

    return response.responseJSON;

}

DRApp.controller("Base",null,{
    home: function() {
        this.it = {
            values: {
                template: '',
                person: '',
                node: ''
            }
        };
        DRApp.rest("GET","/api/setting",null,$.proxy(this.home_data,this));
        DRApp.rest("GET","/api/template",null,$.proxy(this.home_data,this));
    },
    home_data: function(data) {
        if (data.settings) {
            this.it.settings = data.settings;
        }
        if (data.templates) {
            this.it.templates = data.templates;
        }
        if (this.it.settings && this.it.templates) {
            this.application.render(this.it);
        }
    },
    create: function() {
        data = {
            template: parseInt($("#template").val()),
            person: $("#person").val(),
            node: $("#node").val(),
        }
        DRApp.rest("POST","/api/chore",data,$.proxy(this.create_data,this));
    },
    create_data: function(data) {
        this.it.values = data.chore;
        this.application.render(this.it);
    },
    chores: function() {
        DRApp.rest("GET","/api/chore",null,$.proxy(this.chores_data,this));
    },
    chores_data: function(data) {
        this.it = {
            chores: data.chores
        };
        this.application.render(this.it);
    },
    next: function(chore_id) {
        DRApp.rest("POST","/api/chore/" + chore_id + "/next",null,$.proxy(this.action_data,this));
    },
    action_data: function(data) {
        this.application.refresh();
    },
    chore: function() {
        DRApp.rest("GET","/api/chore/" + this.application.current.path.chore_id,null,$.proxy(this.chore_data,this));
    },
    chore_data: function(data) {
        this.it.chore = data.chore;
        this.application.render(this.it);
    },
    incomplete: function(chore_id, task_id) {
        DRApp.rest("POST","/api/chore/" + chore_id + "/task/" + task_id + "/incomplete",null,$.proxy(this.action_data,this));
    },
    complete: function(chore_id, task_id) {
        DRApp.rest("POST","/api/chore/" + chore_id + "/task/" + task_id + "/complete",null,$.proxy(this.action_data,this));
    },
    templates: function() {
        DRApp.rest("GET","/api/template",null,$.proxy(this.templates_data,this));
    },
    templates_data: function(data) {
        this.it = {
            templates: data.templates
        };
        this.application.render(this.it);
    },
    template: function() {
        DRApp.rest("GET","/api/template",null,$.proxy(this.template_data,this));
    },
    template_data: function(data) {
        this.it = {};
        for (var template = 0; template < data.templates.length; template++) {
            if (this.application.current.path.template_id == data.templates[template].id) {
                this.it.template = data.templates[template];
            }
        }
        this.application.render(this.it);
    }
});

DRApp.partial("Header",DRApp.load("header"));
DRApp.partial("Footer",DRApp.load("footer"));

DRApp.template("Home",DRApp.load("home"),null,DRApp.partials);
DRApp.template("Chores",DRApp.load("chores"),null,DRApp.partials);
DRApp.template("Chore",DRApp.load("chore"),null,DRApp.partials);
DRApp.template("Templates",DRApp.load("templates"),null,DRApp.partials);
DRApp.template("Template",DRApp.load("template"),null,DRApp.partials);

DRApp.route("home","/","Home","Base","home");
DRApp.route("chores","/chore","Chores","Base","chores");
DRApp.route("chore","/chore/{chore_id}","Chore","Base","chore");
DRApp.route("templates","/template","Templates","Base","templates");
DRApp.route("template","/template/{template_id}","Template","Base","template");
