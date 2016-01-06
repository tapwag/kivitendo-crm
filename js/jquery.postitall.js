/**
* jquery.postitall.js v1.0
* jQuery Post It All Plugin - released under MIT License
* Author: Javi Filella <txusko@gmail.com>
* http://github.com/txusko/PostItAll
* Copyright (c) 2015 Javi Filella
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*
*/

function rgb2hex( rgb ){
    rgb = rgb.match( /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/ );
    function hex( x ){
        return( "0" + parseInt( x ).toString( 16 ) ).slice( -2 );
    }
    return "#" + hex( rgb[1] ) + hex( rgb[2] ) + hex( rgb[3] );
}

var otherid = 0;

(function ($, $localStorage) {
    "use strict";

    // Debug
    var debugging = true; // or true
    if (typeof console === "undefined") {
        console = {
            log: function () { return undefined; }
        };
    } else if (!debugging || console.log === undefined) {
        console.log = function () { return undefined; };
    }

    // PLUGIN Public methods
    $.extend($.fn, {
        postitall: function (method, data, callback) {
            var t = new PostItAll();
            var elem = $('.PIAeditable').find(this);
            //.filter(function(){ return !$(this).parents('#the_notes').length })
            if(elem.length <= 0)
                elem = $(this);
            elem = elem.filter(function(){ return !$(this).parents('#the_lights').length })
            switch (method) {

                // Destroy the control
                case 'destroy':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.destroy($(e));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.destroy($(e).parent().parent().parent().parent());
                        }
                    });
                return $(this);

                // Get/set options on the fly
                case 'options':
                    // Setter
                    //console.log('options', elem.length, data);
                    var obj = undefined;
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            if (data === undefined) {
                                obj = $(e).data('PIA-options');
                                return false;
                            } else {
                                t.destroy($(e), false);
                                var tempoptions = $(e).data('PIA-options') || {};
                                setTimeout(function() { $.PostItAll.new($.extend(true, tempoptions, data)); }, 200);
                            }
                        } else if($(e).attr('PIA-original') !== undefined) {
                            var oldObj = $(e).parent().parent().parent().parent();
                            if (data === undefined) {
                                obj = oldObj.data('PIA-options');
                                return false;
                            } else {
                                t.destroy(oldObj, false);
                                var tempoptions = oldObj.data('PIA-options') || {};
                                //t.create($.extend(true, t.options, data));
                                setTimeout(function() { $.PostItAll.new($.extend(true, tempoptions, data)); }, 200);
                            }
                        }
                    });
                if(obj !== undefined) {
                    if($(obj).length == 1)
                        return $(obj)[0];
                    return $(obj);
                }
                return $(this);

                // hide note/s
                case 'hide':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.hide($(e).data('PIA-id'));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.hide($(e).parent().parent().parent().parent().data('PIA-id'));
                        }
                    });
                return $(this);

                //show note/s
                case 'show':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.show($(e).data('PIA-id'));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.show($(e).parent().parent().parent().parent().data('PIA-id'));
                        }
                    });
                return $(this);

                // Save object
                case 'save':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.save($(e));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.save($(e).parent().parent().parent().parent());
                        }
                    });
                return $(this);

                // Initializes the control
                case 'new':
                default:
                    var posX = 0, posY = 0, paso = false;
                    if (method !== 'new') {
                        data = method;
                        method = "new";
                    }
                    if(data === undefined || typeof data !== 'object') data = { };

                    //Position defined by the user
                    if(!paso) {
                        if(data.posX !== undefined) {
                            posX = data.posX;
                            paso = true;
                        }
                        if(data.posY !== undefined) {
                            posY = data.posY;
                            paso = true;
                        }
                    }

                    //Check if initialized
                    var initialized = false;
                    $.each($(this).filter(function(){ return !$(this).parents('#the_notes').length }), function (i,e) {
                        if($(e).attr('PIA-original') !== undefined) {
                            initialized = true;
                            return false;
                        }
                    });

                    if(!initialized) {
                        //Create the element/s
                        $.each($(this).filter(function(){ return !$(this).parents('#the_notes').length }), function (i,e) {
                            //Position relative to the element
                            if(!paso) {
                                posX = $(this).offset().left;
                                posY = $(this).offset().top;
                            }
                            $.extend(data, { posX: posX, posY: posY }, true);
                            //console.log('create', i, e);
                            $.PostItAll.new('', data, $(e), callback);
                        });
                    } else {
                        //Show previously initialized, show the notes
                        $.PostItAll.show();
                    }
                return $(this);
            }
        }
    });

    //Global vars : enable and disable features and change the notes behaviour
    $.fn.postitall.globals = {
        prefix          : '#PIApostit_',//Id note prefixe
        filter          : 'all',     //Options: domain, page, all
        savable         : 1,        //Save postit in storage
        randomColor     : 0,         //Random color in new postits
        toolbar         : true,         //Show or hide toolbar
        autoHideToolBar : true,         //Animation efect on hover over postit shoing/hiding toolbar options
        removable       : true,         //Set removable feature on or off
        askOnDelete     : 0,         //Confirmation before note remove
        draggable       : true,         //Set draggable feature on or off
        resizable       : true,         //Set resizable feature on or off
        editable        : true,         //Set contenteditable and enable changing note content
        changeoptions   : true,         //Set options feature on or off
        blocked         : true,         //Postit can not be modified
        minimized       : true,         //true = minimized, false = maximixed
        expand          : true,         //Expand note
        fixed           : true,         //Allow to fix the note in page
        addNew          : true,         //Create a new postit
        showInfo        : 0,            //Show info icon
        pasteHtml       : 1,            //Allow paste html in contenteditor
        htmlEditor      : 0,            //Html editor (trumbowyg)
        autoPosition    : true,         //Automatic reposition of the notes when user resize screen
        addArrow        : 'back',       //Add arrow to notes : none, front, back, all
        changeUserId    : 1
    };

    //Copy of the original global configuration
    $.fn.postitall.globalscopy = $.extend({}, $.fn.postitall.globals, true);

    //Note global vars : Properties, style, features and events of the note
    $.fn.postitall.defaults = {
        //Note properties
        id              : "",                       //Note id
        created         : Date.now(),               //Creation date
        domain          : '',                       //Domain in the url
        page            : '',                       //Page in the url
        osname          : '',                       //Browser informtion & OS name,
        content         : '',                       //Content of the note (text or html)
        position        : 'fixed',                  //Position relative, fixed or absolute
        posX            : '',                       //x coordinate (from left)
        posY            : '',                       //y coordinate (from top)
        right           : '',                       //x coordinate (from right). This property invalidate posX
        height          : 240,                      //Note total height
        width           : 180,                      //Note total width
        minHeight       : 210,                      //Note resizable min-width
        minWidth        : 170,                      //Note resizable min-height
        oldPosition     : {},                       //Position when minimized/collapsed (internal use)
        //Config note style
        style : {
            tresd           : true,                 //General style in 3d format
            backgroundcolor : rgb2hex( $('.ui-state-highlight').css('background-color') ), //Background color in new postits when randomColor = false
            textcolor       : '#0a0e87',            //Text color
            textshadow      : 0,                 //Shadow in the text
            fontfamily      : 'verdana',            //Default font verdana
            fontsize        : '13',              //Default font size
            arrow           : 'none',               //Default arrow : none, top, right, bottom, left
        },
        //Enable / Disable features
        features : $.extend({}, $.fn.postitall.globals, true),
        //Note flags
        flags : {
            blocked         : false,                //If true, the note cannot be edited
            minimized       : false,                //true = Collapsed note / false = maximixed
            expand          : false,                //true = Expanded note / false = normal
            fixed           : false,                //Set position fixed
            highlight       : false,                //Higlight note
        },
        //Attach the note to al html element
        attachedTo : {
            element         : '.tools',                   //Where to attach
            position        : 'bottom',              //Position relative to elemente : top, right, bottom or left
            fixed           : true,                 //Fix note to element when resize screen
            arrow           : true,                 //Show an arrow in the inverse position
        },
        // Callbacks / Event Handlers
        onCreated: function(id, options, obj) { return undefined; },    //Triggered after note creation
        onChange: function (id) { return undefined; },                  //Triggered on each change
        onSelect: function (id) { return undefined; },                  //Triggered when note is clicked, dragged or resized
        onDblClick: function (id) { return undefined; },                //Triggered on double click
        onRelease: function (id) { return undefined; },                 //Triggered on the end of dragging and resizing of a note
        onDelete: function (id) { return undefined; }                   //Triggered when a note is deleted
    };

    //Copy of the original note configuration
    $.fn.postitall.defaultscopy = $.extend({}, $.fn.postitall.defaults, true);
    $.fn.postitall.defaultscopy.style = $.extend({}, $.fn.postitall.defaults.style, true);
    $.fn.postitall.defaultscopy.features = $.extend({}, $.fn.postitall.defaults.features, true);
    $.fn.postitall.defaultscopy.flags = $.extend({}, $.fn.postitall.defaults.flags, true);
    $.fn.postitall.defaultscopy.attachedTo = $.extend({}, $.fn.postitall.defaults.attachedTo, true);

    //Global functions
    jQuery.PostItAll = {

        //Change configuration : type (global, note), opt (object)
        changeConfig : function(type, opt) {
            if(typeof type === 'string') {
                if(type == "global") {
                    if(typeof opt === 'object')
                        $.extend($.fn.postitall.globals, opt, true);
                    return $.fn.postitall.globals;
                } else if(type == "note") {
                    if(typeof opt === 'object') {
                        if(opt.style !== undefined) {
                            $.extend($.fn.postitall.defaults.style, opt.style, true);
                            delete opt.style;
                        }
                        if(opt.features !== undefined) {
                            $.extend($.fn.postitall.defaults.features, opt.features, true);
                            delete opt.features;
                        }
                        if(opt.flags !== undefined) {
                            $.extend($.fn.postitall.defaults.flags, opt.flags, true);
                            delete opt.flags;
                        }
                        if(opt.attachedTo !== undefined) {
                            $.extend($.fn.postitall.defaults.attachedTo, opt.attachedTo, true);
                            delete opt.attachedTo;
                        }
                        $.extend($.fn.postitall.defaults, opt, true);
                    }
                    return $.fn.postitall.defaults;
                }
            }
            return null;
        },

        //Retore configuration to factory defaults : type (all, global, note. default: all)
        restoreConfig : function(type) {
            if(type === undefined)
                type = "all";
            if(typeof type === "string") {
                if(type == "global" || type == "all") {
                    $.extend($.fn.postitall.globals, $.fn.postitall.globalscopy, true);
                    return $.fn.postitall.globals;
                }
                if(type == "note" || type == "all") {
                    $.extend($.fn.postitall.defaults, $.fn.postitall.defaultscopy, true);
                    return $.fn.postitall.defaults;
                }
            }
            return null;
        },

        storageManager : function(callback) {
            storageManager.getStorageManager(function(e) {
                callback(e);
            });
        },

        //New note
        new : function(content, opt, obj, callback) {
            var ok = false;
            if(callback !== undefined) {
                ok = true;
            }
            if(!ok && obj !== undefined && typeof obj === 'function') {
                callback = obj;
                obj = undefined;
                ok = true;
            }
            if(!ok && opt !== undefined && typeof opt === 'function' && content !== undefined && typeof content === 'object') {
                callback = opt;
                opt = content;
                content = "";
                ok = true;
            }
            if(!ok && opt !== undefined && typeof opt === 'function' && content !== undefined && typeof content === 'string') {
                callback = opt;
                opt = undefined;
                ok = true;
            }
            if (!ok && typeof content === 'object') {
                callback = obj;
                obj = opt;
                opt = content;
                content = "";
                ok = true;
            }
            if (!ok && typeof content === 'function') {
                callback = content;
                content = "";
                ok = true;
            }
            if(!ok && content === undefined) {
                content = "";
                ok = true;
            }

            //Position
            var optPos = {};
            optPos.posX = parseInt(window.pageXOffset, 10);
            optPos.posY = parseInt(window.pageYOffset, 10);
            optPos.use = false;

            //console.log('init opt', $.fn.postitall.defaults);
            if(opt === undefined) {
                opt = $.extend(true, {}, $.fn.postitall.defaults);
                opt.posX = optPos.posX;
                opt.posY = optPos.posY;
                optPos.use = true;
            } else {
                if(opt.posX === undefined && opt.posX === undefined) {
                    opt.posX = optPos.posX;
                    opt.posY = optPos.posY;
                    optPos.use = true;
                }
                opt = $.extend(true, {}, $.fn.postitall.defaults, opt);
            }

            if(opt.position == "relative" || opt.position == "fixed") {
                if(!optPos.use) {
                    opt.posX = parseInt(opt.posX, 10) + parseInt(optPos.posX, 10);
                    opt.posY = parseInt(opt.posY, 10) + parseInt(optPos.posY, 10);
                }
                if(opt.position == "fixed") {
                    opt.flags.fixed = true;
                }
                opt.position = "absolute";
            }

            if(optPos.use) {
                opt.posX = optPos.posX + parseInt($.fn.postitall.defaults.posX, 10);
                opt.posY = optPos.posY + parseInt($.fn.postitall.defaults.posX, 10);
            }
            opt.posX = parseInt(opt.posX, 10) + "px";
            opt.posY = parseInt(opt.posY, 10) + "px";

            //New note object
            var note = new PostItAll();

            //Add content
            if($('#the_notes').length <= 0) {
                $('<div id="the_notes"></div>').appendTo($('body'));
            }
            if($('#the_lights').length <= 0) {
                $('<div id="the_lights"><div id="the_lights_close"></div></div>').appendTo($('body'));
                $('#the_lights').click(function() {
                    note.switchOnLights();
                });
            }
            if(obj === undefined) {
                obj = $('<div />', {
                    html: (content !== undefined ? content : '')
                });
            } else {
                var oldObj = obj;
                $(oldObj).attr('PIA-original', '1');
                var newObj = $('<div />').append(oldObj);
                $(newObj).attr('PIA-original', '1');
                obj = newObj;
            }
            $('#the_notes').append(obj);

            //Random color
            var randCol = function(opts) {
                //Random bg & textcolor
                if($.fn.postitall.globals.randomColor && opts.features.randomColor) {
                    if(opts.style.backgroundcolor === $.fn.postitall.defaults.style.backgroundcolor) {
                        opts.style.backgroundcolor = note.getRandomColor();
                    }
                    if(opts.style.textcolor === $.fn.postitall.defaults.style.textcolor) {
                        opts.style.textcolor = note.getTextColor(opts.style.backgroundcolor);
                    }
                    opts.features.randomColor = false;
                }
                return opts;
            };

            //Check if we have the id
            var options = opt;
            //console.log(options.style.backgroundcolor);
            if(options.id !== "") {
                //Random bg & textcolor
                options = randCol(options);
                //Initialize
                setTimeout(function() { note.init(obj, options); if(callback !== undefined) callback($.fn.postitall.globals.prefix + options.id, options, obj[0]); }, 100);
            } else {
                //Get new id
                //console.log('paso');
                note.getIndex(($.fn.postitall.globals.savable || options.features.savable), function(index) {
                    //Id
                    options.id = index;
                    //Random bg & textcolor
                    options = randCol(options);
                    //Initialize
                    setTimeout(function() { note.init(obj, options); if(callback !== undefined) callback($.fn.postitall.globals.prefix + options.id, options, obj[0]); }, 100);
                });
            }
        },

        options : function(id, opt) {
            if(typeof id === 'object') {
                //Change options for all notes
                $('.PIApostit').postitall('options', id);
            } else if (typeof opt === 'object') {
                //Change options for specific notes
                $(id).postitall('options', opt);
            } else {
                return $(id).postitall('options');
            }
        },

        //Hide all
        hide : function(id) {
            this.toggle(id, 'hide');
        },

        //Show all
        show : function(id) {
            this.toggle(id, 'show');
        },

        //hide/show all
        toggle : function(id, action) {
            var paso = false;
            if(action === undefined) action = "show";
            if(id !== undefined && typeof id === 'string') {
                if($($.fn.postitall.globals.prefix + id).length > 0) {
                    $($.fn.postitall.globals.prefix + id).postitall(action);
                    paso = true;
                } else if($(id.toString()).length) {
                    $(id.toString()).postitall(action);
                    paso = true;
                }
            }
            if(!paso) {
                $('.PIApostit').each(function () {
                    $(this).postitall(action);
                });
            }
        },

        //Load all (from storage)
        load : function(callback, callbacks, highlight) {
            var len = -1;
            var iteration = 0;
            var finded = false;
            storageManager.getlength(function(len) {
                if(!len) {
                    if(typeof callback === 'function') callback();
                    return;
                }
                for (var i = 1; i <= len; i++) {
                  storageManager.key(i, function(key) {
                    storageManager.getByKey(key, function(o) {
                      if (o != null && $('#id' + key).length <= 0) {
                        //console.log('o', key, o);
                        if($.fn.postitall.globals.filter == "domain")
                          finded = (o.domain === window.location.origin);
                        else if($.fn.postitall.globals.filter == "page")
                          finded = (o.domain === window.location.origin && o.page === window.location.pathname);
                        else
                          finded = true;
                        if(finded) {
                            if(typeof callbacks === 'object') {
                                console.log(callbacks);
                                if(callbacks.onCreated !== undefined) {
                                    o.onCreated = callbacks.onCreated;
                                }
                                if(callbacks.onChange !== undefined) {
                                    o.onChange = callbacks.onChange;
                                }
                                if(callbacks.onSelect !== undefined) {
                                    o.onSelect = callbacks.onSelect;
                                }
                                if(callbacks.onDblClick !== undefined) {
                                    o.onDblClick = callbacks.onDblClick;
                                }
                                if(callbacks.onRelease !== undefined) {
                                    o.onRelease = callbacks.onRelease;
                                }
                                if(callbacks.onDelete !== undefined) {
                                    o.onDelete = callbacks.onDelete;
                                }
                            }
                            o.flags.highlight = false;
                            if(highlight !== undefined && o.id == highlight) {
                                //console.log('highlight note', highlight);
                                o.flags.highlight = true;
                            }
                            $.PostItAll.new(o);
                        }
                      }
                      if(iteration == (len - 1) && callback != null) {
                          if(typeof callback === 'function') callback();
                          callback = null;
                      }
                      iteration++;
                    });
                  });
                }
            });
        },

        //Save all (to storage)
        save : function() {
            //if(!$.fn.postitall.globals.savable && )
            //    return;
            var options;
            var id;
            $('.PIApostit').each(function(i,e) {
                id = $(e).data('PIA-id');
                options = $(e).data('PIA-options');
                if(id !== undefined && options !== undefined && ($.fn.postitall.globals.savable || options.features.savable)) {
                    $(this).postitall('save');
                }
            });
        },

        //Get number of notes (only in storage)
        length : function(callback) {
            var total = 0;
            var len = -1;
            var iteration = 0;
            var finded = false;
            storageManager.getlength(function(len) {
                if(!len) {
                    callback(total);
                    return;
                }
                for (var i = 1; i <= len; i++) {
                  storageManager.key(i, function(key) {
                    storageManager.getByKey(key, function(o) {
                      if(o != null) {
                        if($.fn.postitall.globals.filter == "domain")
                          finded = (o.domain === window.location.origin);
                        else if($.fn.postitall.globals.filter == "page")
                          finded = (o.domain === window.location.origin && o.page === window.location.pathname);
                        else
                          finded = true;
                        if (finded) {
                            total++;
                        }
                      }
                      if(iteration == (len - 1) && callback != null) {
                          callback(total);
                          callback = null;
                      }
                      iteration++;
                    });
                  });
                }
            });
        },

        //Remove all notes
        remove : function(delInline, delStorage, delDomain) {
            this.destroy(false, delInline, delStorage, delDomain);
        },
        delete : function(delInline, delStorage, delDomain) {
            this.destroy(false, delInline, delStorage, delDomain);
        },
        destroy : function(id, delInline, delStorage, delDomain) {
            if(delInline == undefined)
                delInline = true;
            if(delStorage == undefined)
                delStorage = true;

            if(delInline) {
                //Visible notes
                if(id !== undefined && typeof id === "string") {
                    //Specific note
                    var opt = $(id).postitall('options');
                    if(delStorage) { // && ($.fn.postitall.globals.savable || opt.features.savable)) {
                        $(id).postitall('destroy');
                    } else {
                        $(id).postitall('hide');
                    }
                } else {
                    //All notes
                    $('.PIApostit').each(function () {
                        var opt = $(this).postitall('options');
                        if(delStorage) { // && ($.fn.postitall.globals.savable || opt.features.savable)) {
                            $(this).postitall('destroy');
                        } else {
                            $(this).postitall('hide');
                        }
                    });
                }
            }
            //TODO : Revisar
            if(delStorage && $.fn.postitall.globals.savable) {
                //Storage notes
                $.PostItAll.clearStorage(delDomain);
            }
        },
        clearStorage : function(delDomain, callback) {
            if(delDomain !== undefined) {
                //Delete notes of an specific domain
                storageManager.removeDom({ domain : delDomain }, function() {
                    console.log("Storage cleared for domain", delDomain);
                    if(callback !== undefined) callback();
                });
            } else {
                //Delete all notes
                storageManager.clear(function() {
                    console.log("Storage cleared");
                    if(callback !== undefined) callback();
                });
            }
        }
    };

    //Note class
    var PostItAll = function(obj, opt) {
        this.options = {};
        this.hoverState = false;
    };
    //Definition
    PostItAll.prototype = {

        // Initialize elements
        init : function(obj, opt) {
            //Default options
            this.options = $.extend({}, $.fn.postitall.defaults);
            //Set options
            if (typeof opt !== 'object') {
                opt = {};
            }
            this.setOptions(opt);
            // Do nothing if already initialized
            if (obj.data('PIA-initialized')) {
                return;
            }
            //Modify page content
            opt = $.extend(this.options, opt);
            this.setOptions(opt);
            //obj id
            obj.attr('id', 'PIApostit_' + opt.id);

            //console.log('init');
            this.attachedTo();

            //create stuff
            var newObj = this.create(obj);
            //Set on resize action
            if($.fn.postitall.globals.autoPosition && opt.features.autoPosition)
                $(window).on('resize', $.proxy(this.relativePosition, this));
            //return obj
            return newObj;
        },

        attachedTo : function(options) {
            var data = options;
            if(data === undefined) {
                data = this.options;
            }

            //Position relative to a dom object
            if(data.attachedTo === undefined || typeof data.attachedTo !== 'object') data.attachedTo = { };
            if(data.attachedTo.element !== undefined && data.attachedTo.element !== "") {
                if($(''+data.attachedTo.element).length > 0) {
                    var objToAttach = $(''+data.attachedTo.element).first();
                    var objWidth = objToAttach.width() + parseInt(objToAttach.css('padding-left'),10) + parseInt(objToAttach.css('padding-right'),10);
                    objWidth += parseInt(objToAttach.css('margin-left'),10) + parseInt(objToAttach.css('margin-right'),10);
                    var objHeight = objToAttach.height() + parseInt(objToAttach.css('padding-top'),10) + parseInt(objToAttach.css('padding-bottom'),10);
                    objHeight += parseInt(objToAttach.css('margin-top'),10) + parseInt(objToAttach.css('margin-bottom'),10);

                    var position = {};
                    //console.log('fixed?',this.elementOrParentIsFixed(data.attachedTo.element));
                    if(this.elementOrParentIsFixed(data.attachedTo.element))
                        position = objToAttach.position();
                    else
                        position = objToAttach.offset();

                    if(data.attachedTo.arrow === undefined)
                        data.attachedTo.arrow = true;

                    if(data.attachedTo.position === undefined || data.attachedTo.position === "")
                        data.attachedTo.position = "right middle";
                    var tmpPos = data.attachedTo.position.split(" ");
                    var pos1 = tmpPos[0], pos2 = tmpPos[1];
                    switch(pos1) {
                        case 'top':
                            data.posY = position.top - data.height - 30;
                            if(pos2 == "left") {
                                data.posX = (position.left + (objWidth * 0.1)) - (data.width / 2);
                            } else if(pos2 == "right") {
                                data.posX = (position.left + (objWidth - (objWidth * 0.1))) - (data.width / 2);
                            } else {
                                data.posX = (position.left + (objWidth / 2)) - (data.width / 2);
                            }
                            if(data.attachedTo.arrow) {
                                data.style.arrow = "bottom";
                            }
                        break;
                        case 'right':
                        default:
                            data.posX = position.left + objWidth + 30;
                            if(pos2 == "top") {
                                data.posY = (position.top + (objHeight * 0.1)) - (data.height / 2);
                            } else if(pos2 == "bottom") {
                                data.posY = (position.top + (objHeight - (objHeight * 0.1))) - (data.height / 2);
                            } else {
                                data.posY = (position.top + (objHeight / 2)) - (data.height / 2);
                            }
                            if(data.attachedTo.arrow) {
                                data.style.arrow = "left";
                            }
                        break;
                        case 'bottom':
                            data.posY = position.top + objHeight + 30;
                            if(pos2 == "left") {
                                data.posX = (position.left + (objWidth * 0.1)) - (data.width / 2);
                            } else if(pos2 == "right") {
                                data.posX = (position.left + (objWidth - (objWidth * 0.1))) - (data.width / 2);
                            } else {
                                data.posX = (position.left + (objWidth / 2)) - (data.width / 2);
                            }
                            if(data.attachedTo.arrow) {
                                data.style.arrow = "top";
                            }
                        break;
                        case 'left':
                            data.posX = position.left - data.width - 30;
                            if(pos2 == "top") {
                                data.posY = (position.top + (objHeight * 0.1)) - (data.height / 2);
                            } else if(pos2 == "bottom") {
                                data.posY = (position.top + (objHeight - (objHeight * 0.1))) - (data.height / 2);
                            } else {
                                data.posY = (position.top + (objHeight / 2)) - (data.height / 2);
                            }

                            if(data.attachedTo.arrow) {
                                data.style.arrow = "right";
                            }
                        break;
                    }
                    //console.log('new pos:', data.posX, data.posY, objWidth, position, data);
                    if($($.fn.postitall.globals.prefix + data.id).length > 0) {
                        $($.fn.postitall.globals.prefix + data.id).css({
                            'top': data.posY,
                            'left': data.posX
                        });
                        if(data.style.arrow != "none") {
                            $($.fn.postitall.globals.prefix + data.id).css("overflow", "").css("resize", "");
                        }
                    }

                    //this.setOptions(data);
                    if(data.attachedTo.fixed === undefined)
                        data.attachedTo.fixed = true;
                    if(data.attachedTo.fixed) {
                        //data.features.toolbar = false;
                        //this.hoverOptions();
                        /*if(!data.flags.blocked && $($.fn.postitall.globals.prefix + data.id).length > 0) {
                            $('#pia_blocked_' + data.id).click();
                        } else {
                            data.flags.blocked = true;
                        }*/

                        //if($($.fn.postitall.globals.prefix + data.id).length > 0) {
                            //$($.fn.postitall.globals.prefix + data.id).find('.PIAicon').hide();
                        //}
                        //data.features.draggable = false;
                        //data.features.resizable = false;
                    }
                }
            }
        },

        //Save object
        save : function(obj, callback) {
            var options = obj.data('PIA-options');
            if(!$.fn.postitall.globals.savable && !options.features.savable)
                return;
            //console.log('save', options);
            options.features.savable = true;
            this.saveOptions(options, callback);
        },

        //Save options
        saveOptions : function(options, callback) {
            if(options === undefined)
                options = this.options;
            //console.log('saveOptions', options.posX, options.posY);
            if ($.fn.postitall.globals.savable || options.features.savable) {
                //console.log(options);
                storageManager.add(options, function(error) {
                    if(error != "") {
                        if(callback != null) callback(error);
                        else alert('Error saving options: ' + error);
                    } else {
                        if(callback != null) callback();
                    }
                });
            }
            options.onChange($.fn.postitall.globals.prefix + options.id);
        },

        //Destroy and remove
        destroy : function(obj, callOnDelete) {

            //Swith on lights
            //this.switchOnLights();
            //this.disableKeyboardNav();

            //console.log(obj);
            if(obj === undefined)
                obj = $($.fn.postitall.globals.prefix + this.options.id);
            if(callOnDelete === undefined)
                callOnDelete = true;

            var options = obj.data('PIA-options');
            //console.log(this,options, obj);
            var id = options.id;

            //console.log('destroy', id, $.fn.postitall.globals.savable, options.features.savable);
            //Remove from localstorage
            if ($.fn.postitall.globals.savable || options.features.savable) {
                if(options.features.savable) {
                    storageManager.remove(id);
                    options.onChange($.fn.postitall.globals.prefix + id);
                } else {
                    storageManager.get(id, function(varvalue) {
                        if(varvalue != null && varvalue != "")
                            storageManager.remove(id);
                            options.onChange($.fn.postitall.globals.prefix + id);
                    });
                }
            }
            //Destroy object
            this.remove(options);

            //Event handler on delete
            if(callOnDelete) {
                options.onDelete($.fn.postitall.globals.prefix + id);
            }
        },

        //Hide note
        remove : function(options) {
            //hide object
            var id = options.id;
            //console.log('remove', id);
            $($.fn.postitall.globals.prefix + id).removeData('PIA-id')
                .removeData('PIA-initialized')
                .removeData('PIA-settings')
                .animate({
                          opacity: 0,
                          height: 0
                        }, function() {
                            $(this).remove();
                        });
                /*.hide("slow", function () {
                    $(this).remove();
                });*/
            $(window).off('resize');
        },

        hide : function(id) {
            //hide object
            if($($.fn.postitall.globals.prefix + id).length) {
                $($.fn.postitall.globals.prefix + id).slideUp();
            }
        },

        show : function(id) {
            //show object
            if($($.fn.postitall.globals.prefix + id).length) {
                $($.fn.postitall.globals.prefix + id).slideDown();
            }
        },

        //When user change arrow
        arrowChangeOption : function(value) {
            var index = this.options.id;
            var options = this.options;
            if($.fn.postitall.globals.addArrow == "none" && options.features == "none") {
                return;
            }
            //console.log('arrowChangeOption', options.style.arrow, value);
            //Get new position
            if(options.style.arrow == value || value == 'none') {
                //If this position is the same as before, remove arrow and show selectors
                options.style.arrow = 'none';
                $('.selectedArrow_'+index).show();
                $('.selectedArrow_'+index).find('span').show();
            } else {
                //Set arrow and hide selectors
                options.style.arrow = value;
                $('.selectedArrow_'+index).hide();
            }

            //Change options arrow select
            $('#idAddArrow_'+index).val(options.style.arrow);

            this.hideArrow();
            this.showArrow();
            this.saveOptions(options);
            return options;
        },
        // Save Userid
        changeUserId : function() {
            this.saveOptions();
        },
        //Hide arrow & icons
        hideArrow : function() {
            var index = this.options.id;
            //Remove previous arrow
            $($.fn.postitall.globals.prefix + index).removeClass('arrow_box_top arrow_box_right arrow_box_bottom arrow_box_left', 1000, "easeInElastic");
            $($.fn.postitall.globals.prefix + index).find('.icon_box').hide();
            if(!$.ui) $($.fn.postitall.globals.prefix + index).css('overflow', 'hidden').css('resize', 'both');
            console.log('hide');
        },

        //Show arrow and icons
        showArrow : function(index, options) {
            var index = this.options.id;
            var options = this.options;
            //Add arrow
            switch(options.style.arrow) {
                case 'top':
                    $($.fn.postitall.globals.prefix + index).addClass('arrow_box_top', 1000, "easeInElastic").css('overflow', '').css('resize', '');
                break;
                case 'right':
                    $($.fn.postitall.globals.prefix + index).addClass('arrow_box_right', 1000, "easeInElastic").css('overflow', '').css('resize', '');
                break;
                case 'bottom':
                    $($.fn.postitall.globals.prefix + index).addClass('arrow_box_bottom', 1000, "easeInElastic").css('overflow', '').css('resize', '');
                break;
                case 'left':
                    $($.fn.postitall.globals.prefix + index).addClass('arrow_box_left', 1000, "easeInElastic").css('overflow', '').css('resize', '');
                break;
            }
            //console.log('options.style.arrow',options.style.arrow);
            if(options.style.arrow == 'none')
                $($.fn.postitall.globals.prefix + index).find('.icon_box').show();
            var icon = $($.fn.postitall.globals.prefix + index).find('div[data-value="'+options.style.arrow+'"]');
            icon.show();
            icon.find('span').hide();
            console.log('show');
        },

        //Autoresize note
        autoresize : function() {
            var id = this.options.id;
            var options = this.options;
            var obj = $($.fn.postitall.globals.prefix + id);
            if(options.flags.minimized || options.flags.expand)
                return;
            var toolBarHeight = parseInt(obj.find('.PIAtoolbar').height(), 10);
            var contentHeight = parseInt(obj.find('.PIAeditable').height(), 10) + toolBarHeight,
                posX = obj.css('left'),
                posY = obj.css('top'),
                divWidth = parseInt(obj.width(), 10) + parseInt(obj.css('padding-left'),10) + parseInt(obj.css('padding-right'),10) + 2,
                divHeight = parseInt(obj.css('height'), 10),
                minDivHeight = options.minHeight;
            var htmlEditorBarHeight = parseInt(obj.find('.trumbowyg-button-pane').height(), 10);
            if(isNaN(htmlEditorBarHeight) || htmlEditorBarHeight <= 30) {
                htmlEditorBarHeight = 35;
            }
            //console.log('divHeight',divHeight,'contentHeight',contentHeight);
            if(contentHeight > divHeight - 30) {
                divHeight = contentHeight + htmlEditorBarHeight;
            } else if(contentHeight > options.minHeight) {
                //Comment this line if we want to preserve user height
                divHeight = contentHeight + htmlEditorBarHeight;
            }
            //console.log('newHeight',divHeight);
            options.height = divHeight;
            //obj.animate({ 'height': divHeight }, 250);
            obj.css('height', divHeight);
            //console.log('auto', divWidth);
            options.width = divWidth;

            if(options.attachedTo.element !== "" && options.attachedTo.fixed)
                this.attachedTo();
        },

        //Get next note Id
        getIndex : function(savable, callback) {
            if(!savable) {
                callback(this.guid());
                return;
            }

            var len = 0;
            var content = "";
            var paso = false;
            storageManager.getlength(function(len) {
                //console.log('getIndex.len', len);
                var loadedItems = $('.PIApostit').length;
                var items = len + loadedItems + 1;
                //console.log('getIndex.items', items);
                for(var i = 1; i <= items; i++) {
                    (function(i) {
                        storageManager.get(i, function(content) {
                            console.log('getIndex.get', paso, i, content);
                            if(!paso && content == "" && $( "#idPostIt_" + i ).length <= 0) {
                                console.log('nou index', i);
                                paso = true;
                            }
                            if(callback != null && (paso || i >= items)) {
                                callback(i);
                                callback = null;
                            }
                        });
                    })(i);
                }
            });
        },

        // Set options
        setOptions : function(opt, save) {
            var t = this;
            if (typeof opt !== 'object') {
                opt = {};
            }
            if (save === undefined) {
                save = false;
            }
            t.options = $.extend(t.options, opt);
            /*jslint unparam: true*/
            $.each(['onChange', 'onSelect', 'onRelease', 'onDblClick'], function (i, e) {
                if (typeof t.options[e] !== 'function') {
                    t.options[e] = function () { return undefined; };
                }
            });
            /*jslint unparam: false*/
            if (save) {
                //console.log('setOptions save', t.options);
                this.saveOptions(t.options);
            }
        },

        // Get user selection text on page
        getSelectedText : function() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection();
            } else if (document.selection) {
                text = document.selection.createRange().text;
            }
            return text;
        },

        // Get user selection html on page
        getSelectedHtml : function() {
            var html = "";
            if (typeof window.getSelection != "undefined") {
                var sel = window.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement("div");
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (typeof document.selection != "undefined") {
                if (document.selection.type == "Text") {
                    html = document.selection.createRange().htmlText;
                }
            }
            return html;
        },

        //Recover client OS name
        getOSName : function() {
            var OSName="Unknown OS";
            var browserNav = this.options.osname;
            if (browserNav.indexOf("Win")!=-1) OSName="Windows";
            if (browserNav.indexOf("Mac")!=-1) OSName="MacOS";
            if (browserNav.indexOf("X11")!=-1) OSName="UNIX";
            if (browserNav.indexOf("Linux")!=-1) OSName="Linux";
            return OSName;
        },

        //flip cover to back
        switchBackNoteOn : function(flipClass) {
            var id = this.options.id;
            $('#the_lights').data('highlightedId', id);
            this.enableKeyboardNav();
            $('#idPostIt_' + id + ' > .PIAback').css('visibility', 'visible');
            $($.fn.postitall.globals.prefix + id).addClass('PIAflip ' + flipClass, function () {
                $($.fn.postitall.globals.prefix + id + ' > .PIAfront').css('visibility', 'hidden');
                $($.fn.postitall.globals.prefix + id + ' > .ui-resizable-handle').css('visibility', 'hidden');
            });
            if($.fn.postitall.globals.resizable && $.ui) $($.fn.postitall.globals.prefix + id).resizable("disable");
            //if($.fn.postitall.globals.draggable && $.ui) $($.fn.postitall.globals.prefix + id).draggable("disable");
            //$(this).parent().parent().parent().parent().addClass('PIAflip');
        },

        //flip back to cover
        switchBackNoteOff : function(flipClass) {
            var id = this.options.id;
            $('#the_lights_close').click();
            this.disableKeyboardNav();
            $('#idPostIt_' + id + ' > .PIAfront').css('visibility', 'visible');
            $($.fn.postitall.globals.prefix + id).removeClass('PIAflip ' + flipClass, function () {
                $($.fn.postitall.globals.prefix + id + ' > .PIAback').css('visibility', 'hidden');
                $($.fn.postitall.globals.prefix + id + ' > .ui-resizable-handle').css('visibility', '');
            });
            if($.fn.postitall.globals.resizable && $.ui) $($.fn.postitall.globals.prefix + id).resizable("enable");
            //if($.fn.postitall.globals.draggable && $.ui) $($.fn.postitall.globals.prefix + id).draggable("enable");
        },

        //add transparency to note
        switchTrasparentNoteOn : function() {
            var id = this.options.id;
            var options = this.options;
            var components = this.getRGBComponents(options.style.backgroundcolor);
            //$($.fn.postitall.globals.prefix + id).css('background', 'rgb('+components.R+', '+components.G+', '+components.B+')');
            $($.fn.postitall.globals.prefix + id).css('background-color', 'rgba('+components.R+', '+components.G+', '+components.B+', 0.8)');
        },

        //remove transparency to note
        switchTrasparentNoteOff : function() {
            var id = this.options.id;
            var options = this.options;
            var components = this.getRGBComponents(options.style.backgroundcolor);
            //$($.fn.postitall.globals.prefix + id).css('background', 'rgb('+components.R+', '+components.G+', '+components.B+')');
            $($.fn.postitall.globals.prefix + id).css('background-color', 'rgba('+components.R+', '+components.G+', '+components.B+', 1)');
        },

        //Switch off lights and highlight note
        switchOffLights : function() {
            var t = this;
            var id = t.options.id;
            if(id !== undefined) {
                $($.fn.postitall.globals.prefix + id).css({
                    'z-index': 999999,
                    'border': '1px solid rgb(236, 236, 0)',
                    'box-shadow': 'rgb(192, 195, 155) 1px 1px 10px 3px',
                });
                //t.hideArrow();
            }
            $("#the_lights").fadeTo("fast", 0.6, function() {
                $("#the_lights").css('display','block');
                $("#the_lights").css({'height':($(document).height())+'px'});
                $("#the_lights").data('highlightedId', id);
                // lock scroll position, but retain settings for later
                var scrollPosition = [
                    self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                    self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
                ];
                $('html').data('scroll-position', scrollPosition);
                $('html').data('previous-overflow', $('html').css('overflow'));
                $('html').css('overflow', 'hidden');
                window.scrollTo(scrollPosition[0], scrollPosition[1]);
                $(window).on('resize', $.proxy(t.resizeAction, t));
            });
        },

        //Switch lights on & remove highlighted note
        switchOnLights : function() {
            var id = $("#the_lights").data('highlightedId');
            var options = $($.fn.postitall.globals.prefix + id).data('PIA-options');
            var t = this;
            if(id !== "" && options !== null && options !== undefined) {
                $("#the_lights").data('highlightedId', '');
                $($.fn.postitall.globals.prefix + id).css({'z-index': 999995,
                    'border': '1px solid ' + $($.fn.postitall.globals.prefix + id).css('background-color'),
                });
                if(options.flags.expand) {
                    $('#pia_expand_'+id).click();
                } else {
                    $('#pia_close_'+id).click();
                }
            }
            if($("#the_lights").css('display') != "none") {
                $("#the_lights").css('display','block');
                $("#the_lights").fadeTo("slow",0, function() {
                    $("#the_lights").css('display','none');
                });
                // un-lock scroll position
                var scrollPosition = $('html').data('scroll-position');
                if(scrollPosition != undefined) {
                    //console.log('unlock', scrollPosition);
                    var tmpOvf = $('html').data('previous-overflow');
                    $('html').css('overflow', (tmpOvf != "hidden") ? tmpOvf : "visible" );
                    window.scrollTo(scrollPosition[0], scrollPosition[1]);
                }
                $(window).off('resize');
                //Set on resize action
                if($.fn.postitall.globals.autoPosition) // && options.features.autoPosition)
                    $(window).on('resize', $.proxy(t.relativePosition, t));

            }
        },

        //On resize when lights are off
        switchOffLightsResize : function() {
            $("#the_lights").css({'height':($(document).height())+'px'});
        },

        //Enable keyboard actions
        enableKeyboardNav : function(callback) {
            //console.log('enableKeyboardNav');
            this.callback = callback;
            $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
        },

        //Disable keybord actions
        disableKeyboardNav : function() {
            //console.log('disableKeyboardNav');
            $(document).off('keyup.keyboard');
        },

        //Keyboard actions
        keyboardAction : function(event) {
            //console.log('keyboardAction', event);
            var KEYCODE_ESC        = 27;
            var keycode = event.keyCode;
            var key     = String.fromCharCode(keycode).toLowerCase();
            //On keypress ESC
            if (keycode === KEYCODE_ESC) { // || key.match(/x|o|c/)) {
                //console.log('key press ESC');
                if(this.callback != undefined) this.callback();
                this.switchOnLights();
                this.disableKeyboardNav();
            }
        },

        //Resize expanded note when screen size changes
        resizeAction : function(event) {
            var t = this;
            delay(function(){
                //console.log('resizeAction', t.options.id);
                //Lights switched off
                var highlightedId = $("#the_lights").data('highlightedId');
                if(highlightedId !== undefined && highlightedId !== ""){
                    t.switchOffLightsResize();
                    var options = $($.fn.postitall.globals.prefix + highlightedId).data('PIA-options');
                    if(options.flags.expand) {
                        $($.fn.postitall.globals.prefix + highlightedId).css({
                            top:'10px'
                        }).animate({
                            'height': $(window).height() - 30,
                            'width': $(window).width() - 30
                        });
                    }
                }
            }, 500);
        },

        //On screen resize, notes will preserve relative position to new width screen
        relativePosition : function(event) {
            var t = this;
            if(!$.fn.postitall.globals.autoPosition || !t.options.features.autoPosition) {
                $(window).off('resize');
                return;
            }
            var obj, options;
            delay(function(){
                $('.PIApostit').each(function(i,e) {
                    obj = $($.fn.postitall.globals.prefix + $(e).data('PIA-id'));
                    options = $($.fn.postitall.globals.prefix + $(e).data('PIA-id')).data('PIA-options');
                    //console.log(i,options,obj);
                    if(options.attachedTo.element !== undefined && options.attachedTo.element !== "") {
                        //Attached elements
                        if(options.attachedTo.fixed !== undefined && options.attachedTo.fixed)
                            t.attachedTo(options);
                    } else {
                        //Floating elements
                        //console.log('new pos for note ', i, e);
                        var noteLoc = obj.offset();
                        var screenLoc = { 'height': $(window).height(), 'width': $(window).width() };
                        var top = noteLoc.top;
                        var left = noteLoc.left;
                        var width = parseInt($(e).css('width'), 10) + parseInt($(e).css('padding-left'), 10) + parseInt($(e).css('padding-right'), 10);
                        var height = parseInt($(e).css('height'), 10) + parseInt($(e).css('padding-top'), 10) + parseInt($(e).css('padding-bottom'), 10);

                        var x1 = left, x2 = (left + width), y1 = top, y2 = (top + height);
                        var relTop = (y1 / screenLoc.height) * 100;
                        var relLeft = (x1 / screenLoc.width) * 100;
                        var relWidth = ((x2 - x1) / screenLoc.width) * 100;
                        var relHeight = ((y2 - y1) / screenLoc.height) * 100;

                        $(e).css({
                            //'top': relTop + "%",
                            'left': relLeft + "%",
                            //'width': relWidth + "%",
                            //'height': relHeight + "%"
                        });
                        options.posX = obj.offset().left;
                    }
                    //Save
                    obj.data('PIA-options', options);
                    //console.log('options', options);
                });
                //$.PostItAll.save();
            }, 100);
        },

        //Save current note position in options.oldPosition
        saveOldPosition : function() {
            var obj = $($.fn.postitall.globals.prefix + this.options.id);
            var leftMinimized = obj.css('left');
            if(this.options.oldPosition !== undefined && this.options.oldPosition.leftMinimized !== undefined)
                leftMinimized = this.options.oldPosition.leftMinimized;
            var propCss = {
                'position': obj.css('position'),
                'left': obj.css('left'),
                'top': obj.css('top'),
                'height': obj.css('height'),
                'width': obj.css('width'),
                'leftMinimized': leftMinimized,
            };
            this.options.oldPosition = propCss;
            //console.log('saveOldPosition', this.options.oldPosition);
            this.setOptions(this.options, true);
        },

        //Restore note with options.oldPosition
        restoreOldPosition : function(scrollToNote) {
            if(scrollToNote === undefined)
                scrollToNote = false;

            //console.log('restoreOldPosition');
            var t = this;
            var options = t.options;
            var id = options.id;
            //console.log('restoreOldPosition', options.oldPosition);
            $($.fn.postitall.globals.prefix + id).animate({
                'left': options.oldPosition.left,
                'width': options.oldPosition.width,
                'height': options.oldPosition.height,
            }, 500, function() {
                if(scrollToNote) {
                    if(options.position != "fixed") {
                        var scrollTop1 = self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop;
                        var scrollBottom1 = scrollTop1 + $(window).height();
                        var scrollTop2 = parseInt(options.oldPosition.top, 10);
                        var scrollBottom2 = scrollTop2 + parseInt(options.height,10);
                        if(scrollTop2 > scrollTop1 && scrollBottom2 < scrollBottom1) {
                            ;
                        } else {
                            $('html, body').animate({
                                scrollTop: scrollTop2 - parseInt(options.height,10)
                            }, 1000);
                        }
                    }
                }
                t.showArrow();
                $(this).css({
                    'position': options.oldPosition.position,
                    'top': options.oldPosition.top,
                    'bottom': 'auto',
                });
                $(this).find( ".PIAeditable" ).css('height', 'auto');
                t.autoresize();
                //animate resize
                if(options.flags.blocked) {
                    options.flags.blocked = false;
                    t.blockNote();
                } else {
                    t.hoverOptions(id, true);
                }
                t.switchTrasparentNoteOff();
                t.switchOnLights();
            });
        },

        //hide/show divList objects
        toogleToolbar : function(action, divlist) {
            var t = this;
            var options = t.options;
            var index = options.id;
            var type = "";
            var fadeOuTime = 200;
            for(var i = 0; i < divlist.length; i++) {
                type = divlist[i].substring(0,1);
                if(type != "#" && type != ".") {
                    type = "#";
                } else {
                    divlist[i] = divlist[i].substring(1);
                }
                if(action == "hide") {
                    $(type + divlist[i] + index).fadeTo(0, 0, function() {
                        $(this).hide();
                    });
                } else {
                    $(type + divlist[i] + index).fadeTo(0, 1, function() {
                        $(this).show();
                    });
                }
            }
            if(action == "hide") {
                if ($.fn.postitall.globals.resizable && options.features.resizable) {
                    if ($.ui) $($.fn.postitall.globals.prefix + index).resizable("disable");
                }
                if ($.fn.postitall.globals.draggable && options.features.draggable) {
                    //draggable
                    if ($.ui) $($.fn.postitall.globals.prefix + index).draggable("disable");
                    $('#pia_toolbar_'+index).css('cursor', 'inherit');
                }
            } else {
                if ($.fn.postitall.globals.resizable && options.features.resizable) {
                    if ($.ui) $($.fn.postitall.globals.prefix + index).resizable("enable");
                }
                if ($.fn.postitall.globals.draggable && options.features.draggable) {
                    if ($.ui) $($.fn.postitall.globals.prefix + index).draggable("enable");
                    $('#pia_toolbar_'+index).css('cursor', 'move');
                }
                t.hoverState = true;
                //t.hoverOptions(index, true);
            }
        },

        //Expand note
        expandNote : function() {
            var t = this;
            var index = t.options.id;
            var options = t.options;
            $('#the_lights_close').hide();
            $('#pia_expand_' + index).removeClass('PIAexpand').addClass('PIAmaximize');
            t.hoverOptions(index, false);
            t.saveOldPosition();
            t.toogleToolbar('hide', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_minimize_', 'pia_new_']);
            t.hideArrow();
            t.switchTrasparentNoteOn();
            t.switchOffLights();
            // Expand note
            $($.fn.postitall.globals.prefix + index).css({
                'top':'10px',
                'position': 'fixed',
            }).animate({
                'height': $(window).height() - 30,
                'width': $(window).width() - 30,
                'top': '10px',
                'left': '10px',
            }, 500, function() {
                $('.PIApostit').css('z-index', 999995);
                $(this).css('z-index', '999999');
                $( "#pia_editable_" + index ).css('height',($(window).height() - 120));
                $( "#pia_editable_" + index ).focus();
            });
            options.flags.expand = true;
            t.enableKeyboardNav();
            t.saveOptions(options);
        },

        //Collapse note (restoreOldPosition)
        collapseNote : function() {
            var t = this;
            var index = t.options.id;
            var options = t.options;

            $('#the_lights_close').show();
            $('#pia_expand_' + index).removeClass('PIAmaximize').addClass('PIAexpand');
            $($.fn.postitall.globals.prefix + index).css('position', options.position);
            // show toolbar
            t.toogleToolbar('show', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_minimize_', 'pia_new_']);
            //restore oldposition
            t.restoreOldPosition();
            //newstate
            options.flags.expand = false;
            t.saveOptions(options);
        },

        //Minimize/Maximize note
        minimizeNote : function() {
            var t = this;
            var index = t.options.id;
            var options = t.options;
            var obj = $($.fn.postitall.globals.prefix + index);

            if(!$.fn.postitall.globals.minimized || !options.features.minimized)
                return;

            //minimize action
            var minimize = function() {
                t.hoverOptions(index, false);
                $('#pia_editable_'+index).hide();
                $('#pia_minimize_'+index).removeClass('PIAminimize').addClass('PIAmaximize');
                options.flags.minimized = true;
                //Add some start text to minimized note
                var txtContent = " " + $('#pia_editable_'+index).text();
                if(txtContent.length > 18)
                    txtContent = txtContent.substring(0,15) + "...";
                var smallText = $('<div id="pia_minimized_text_'+index+'" class="PIAminimizedText" />').text(txtContent);
                $('#pia_toolbar_'+index).append(smallText);
                //hide toolbar
                t.toogleToolbar('hide', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_expand_', 'pia_new_']);

                //Enable draggable x axis
                if ($.fn.postitall.globals.draggable && options.features.draggable) {
                    //draggable
                    if ($.ui) {
                        obj.draggable("enable");
                        obj.draggable({ axis: "x" });
                    }
                }
                t.saveOldPosition();
                //Minimize
                $($.fn.postitall.globals.prefix + index).css({'position': 'fixed','top':'auto'}).animate({
                    'width': (options.minWidth + 20),
                    'height': '20px',
                    'bottom': '0',
                    'left': options.oldPosition.leftMinimized,
                }, 500, function() {
                    t.hideArrow();
                    t.switchTrasparentNoteOn();
                    $($.fn.postitall.globals.prefix + index).css({position:'fixed'})
                });
            };
            //maximize action (restoreOldPosition)
            var maximize = function() {
                $('#pia_editable_'+index).show();
                $('#pia_minimize_'+index).removeClass('PIAmaximize').addClass('PIAminimize');
                options.flags.minimized = false;
                // show toolbar
                t.toogleToolbar('show', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_expand_', 'pia_new_']);
                $('#pia_minimized_text_'+index).remove();
                //Remove draggable axis
                if ($.fn.postitall.globals.draggable && options.features.draggable) {
                    if ($.ui) obj.draggable({ axis: "none" });
                }
                t.restoreOldPosition(true);
                t.switchTrasparentNoteOff();
            };
            //Action
            if(!options.flags.minimized) {
                minimize();
            } else {
                maximize();
            }
            //Save feature
            t.save(obj);
        },

        //Block note
        blockNote : function() {
            var t = this;
            var index = t.options.id;
            var options = t.options;
            var obj = $($.fn.postitall.globals.prefix + index);

            if(!$.fn.postitall.globals.blocked || !options.features.blocked)
                return;

            var ides = ['pia_config_', 'pia_fixed_', 'pia_delete_', 'idPIAIconBottom_', '.selectedArrow_'];
            if(!options.flags.expand)
                ides.push('pia_expand_');
            if(!options.flags.minimized)
                ides.push('pia_minimize_');

            if(options.flags.blocked) {
                $('#pia_blocked_'+index.toString()).removeClass('PIAblocked2').addClass('PIAblocked');
                $('#pia_editable_'+index.toString()).attr('contenteditable', true).css("cursor", "");
                //toolbar
                t.toogleToolbar('show', ides);
                //onhover actions
                t.hoverOptions(index, true);
                //new state
                options.flags.blocked = false;
            } else {
                $('#pia_blocked_'+index.toString()).removeClass('PIAblocked').addClass('PIAblocked2');
                $('#pia_editable_'+index.toString()).attr('contenteditable', false).css("cursor", "auto");
                //disabel onhover actios
                t.hoverOptions(index, false);
                //toolbar
                t.toogleToolbar('hide', ides);
                //new state
                options.flags.blocked = true;
            }
            //Save feature
            t.save(obj);
        },

        //Fix note position
        fixNote : function() {
            var t = this;
            var index = t.options.id;
            var options = t.options;
            var obj = $($.fn.postitall.globals.prefix + index);
            if(options.flags.fixed) {
                $('#pia_fixed_'+index).removeClass('PIAfixed2 PIAiconFixed').addClass('PIAfixed PIAicon');
                options.position = "absolute";
                options.posY = obj.offset().top;
                obj.removeClass("fixed");
                options.attachedTo.element = "";
                options.flags.fixed = false;
            } else {
                $('#pia_fixed_'+index).removeClass('PIAfixed PIAicon').addClass('PIAfixed2 PIAiconFixed');
                options.position = "fixed";
                options.posY = parseInt(options.posY, 10) - $(document).scrollTop();
                obj.addClass("fixed");
                obj.css('z-index', 999996);
                options.flags.fixed = true;
            }
            obj.css('position', options.position);
            obj.css('left', parseInt(options.posX, 10) + "px");
            obj.css('top', parseInt(options.posY, 10) + "px");
            //Save features
            t.setOptions(options);
            t.save(obj);
        },

        //Enable/Disable auto-hide toolbar icons when hover over the note
        hoverOptions : function(index, enabled) {

            //Hide toolbar
            if(!$.fn.postitall.globals.toolbar || !this.options.features.toolbar)
                return;

            if(!$.fn.postitall.globals.autoHideToolBar || !this.options.features.autoHideToolBar)
                enabled = false;

            var fadeInTime = 200;
            var fadeOuTime = 600;
            var t = this;

            if(enabled) {
                setTimeout(function(){
                    //Options
                    $( $.fn.postitall.globals.prefix + index ).hover(function() {
                        $($.fn.postitall.globals.prefix + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeInTime, 1);
                        if(t.options.style.arrow === undefined || t.options.style.arrow == "none")
                            $( $.fn.postitall.globals.prefix + index).find(".icon_box").fadeTo(fadeOuTime, 1);
                        $($.fn.postitall.globals.prefix + index + ' > .ui-resizable-handle').fadeTo(fadeInTime, 1);
                        t.hoverState = true;
                    }, function() {
                        setTimeout(function() {
                            if(!t.hoverState) {
                                $($.fn.postitall.globals.prefix + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeOuTime, 0);
                                $($.fn.postitall.globals.prefix + index).find(".icon_box").fadeTo(fadeOuTime, 0);
                                $($.fn.postitall.globals.prefix + index + ' > .ui-resizable-handle').fadeTo(fadeOuTime, 0);
                            }
                        },(fadeOuTime - fadeInTime));
                        t.hoverState = false;
                    });
                    if(!t.hoverState) {
                        $($.fn.postitall.globals.prefix + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeOuTime, 0);
                        $($.fn.postitall.globals.prefix + index).find(".icon_box").fadeTo(fadeOuTime, 0);
                        $($.fn.postitall.globals.prefix + index + ' > .ui-resizable-handle').fadeTo(fadeOuTime, 0);
                    }
                },100);
                return;
            }
            t.hoverState = false;
            //Options
            $( $.fn.postitall.globals.prefix + index ).unbind('mouseenter mouseleave');
            //console.log('t.options.style.arrow',t.options.style.arrow);
            if(t.options.style.arrow === undefined || t.options.style.arrow == "none")
                $( $.fn.postitall.globals.prefix + index).find(".icon_box").fadeTo(fadeOuTime, 1);
            $( $.fn.postitall.globals.prefix + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeInTime, 1);
        },

        //Get a random color (if the feature is enabled, otherwhise will return default background color)
        getRandomColor : function() {
            var randomColor = "";
            if($.fn.postitall.globals.randomColor && $.fn.postitall.defaults.features.randomColor) {
                //Random color
                //var colors = ["red", "blue", "yellow", "black", "green"];
                //return colors[Math.floor(Math.random() * colors.length)];
                randomColor = "#"+(Math.random()*0xFFFFFF<<0).toString(16);
            } else {
                //Default postit color
                randomColor = $.fn.postitall.defaults.style.backgroundcolor;
            }
            if(randomColor.length < 7) {
                var num = 7 - randomColor.length;
                var ret = new Array( num + 1 ).join("0");
                randomColor = randomColor + ret.toString();
            }
            return randomColor;
        },

        //Get text color relative tot hexcolor (if the featured is enabled, otherwise will return default text color)
        getTextColor : function(hexcolor) {
            if($.fn.postitall.globals.randomColor && $.fn.postitall.defaults.features.randomColor) {
                //Inverse of background (hexcolor)
                var nThreshold = 105;
                var components = this.getRGBComponents(hexcolor);
                var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
                return ((255 - bgDelta) < nThreshold) ? "#111111" : "#eeeeee";
            } else {
                //Default postit text color
                return $.fn.postitall.defaults.style.textcolor;
            }
        },

        //Get css text-shadow style
        getTextShadowStyle : function(hexcolor) {
            //console.log(hexcolor);
            var nThreshold = 105;
            var components = this.getRGBComponents(hexcolor);
            var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
            return ((255 - bgDelta) < nThreshold) ? "tresdblack" : "tresd";
        },

        //Get rgb from an hex color
        getRGBComponents : function(color) {
            var r = color.substring(1, 3);
            var g = color.substring(3, 5);
            var b = color.substring(5, 7);
            return {
               R: parseInt(r, 16),
               G: parseInt(g, 16),
               B: parseInt(b, 16)
            };
        },

        //Retrive unique random id (non savable notes)
        guid : function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        },

        //Check if the element or her parents have a fixed position
        elementOrParentIsFixed : function(element) {
            var $element = $(element);
            var $checkElements = $element.add($element.parents());
            var isFixed = false;
            $checkElements.each(function(){
                if ($(this).css("position") === "fixed") {
                    isFixed = true;
                    return false;
                }
            });
            return isFixed;
        },

        //Create note from an object
        create : function(obj) {

            var t = this;
            var options = t.options;
            var index = options.id.toString();

            //Highlight note
            if(options.flags.highlight) {
                t.switchOffLights();
                t.enableKeyboardNav();
            }

            obj.data('PIA-id', index)
                .data('PIA-initialized', true)
                .data('PIA-options', options);
            //Postit editable content
            if (options.content === "") {
                if (obj.html() !== "") {
                    options.content = obj.html();
                }
            }
            //Front page: toolbar
            var barCursor = "cursor: inherit;";
            if ($.fn.postitall.globals.draggable && options.features.draggable) {
                barCursor = "cursor: move;";
            }
            var toolbar = $('<div />', {
                'id': 'pia_toolbar_' + index,
                'class': 'PIAtoolbar',
                'style': barCursor
            });

            //Drag support without jQuery UI - don't work so much well...
            if (!$.ui) {
                if ($.fn.postitall.globals.draggable && options.features.draggable) {
                    toolbar.drags();
                }
            }

            //Delete icon
            if($.fn.postitall.globals.removable) {
                if (options.features.removable) {
                    toolbar.append($('<div />', {
                        'id': 'pia_delete_' + index,
                        'class': 'PIAdelete PIAicon'
                    }).click(function (e) {
                        //console.log('aki1');
                        if (obj.hasClass('PIAdragged')) {
                            //console.log('aki2');
                            obj.removeClass('PIAdragged');
                        } else {
                            //console.log('aki3');
                            if($.fn.postitall.globals.askOnDelete && options.features.askOnDelete) {
                                if ($(this).parent().find('.ui-widget2').length <= 0) {
                                    $('.backContent_' + index).hide();
                                    $('#idBackDelete_' + index + ' > .PIABox').css({
                                        //'width': options.width - 10,
                                        'height': options.height - 40
                                    });
                                    $('#idBackDelete_' + index).show();
                                    t.switchBackNoteOn('PIAflip2');
                                    t.switchOffLights();
                                }
                            } else {
                                t.destroy();
                            }
                        }
                        e.preventDefault();
                    }));
                }
            }

            //Config icon
            if($.fn.postitall.globals.changeoptions) {
                if (options.features.changeoptions) {
                    toolbar.append(
                        $('<div />', {
                            'id': 'pia_config_' + index,
                            'class': 'PIAconfig PIAicon'
                        }).click(function (e) {
                            if (obj.hasClass('PIAdragged')) {
                                obj.removeClass('PIAdragged');
                            } else {
                                $('.backContent_'+index).hide();
                                $('#idBackConfig_'+index+' > .PIABox').css({
                                    //'width': options.width - 10,
                                    'height': options.height - 40
                                });
                                $('#idBackConfig_'+index).show();
                                t.switchBackNoteOn('PIAflip2');
                            }
                            e.preventDefault();
                        })
                    );
                }
            }

            //Fixed
            if($.fn.postitall.globals.fixed) {
                if(options.features.fixed) {
                    toolbar.append(
                        $('<div />', {
                            'id': 'pia_fixed_' + index,
                            'class': 'PIAfixed' + (options.flags.fixed ? '2 PIAiconFixed' : ' PIAicon') + ' '
                        }).click(function (e) {
                            if (obj.hasClass('PIAdragged')) {
                                obj.removeClass('PIAdragged');
                            } else {
                                t.fixNote();
                            }
                            e.preventDefault();
                        })
                    );
                }
            }

            //MINIMIZE
            if($.fn.postitall.globals.minimized && options.features.minimized) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_minimize_' + index,
                        'class': (options.flags.minimized ? 'PIAmaximize' : 'PIAminimize') + ' PIAicon'
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            t.minimizeNote();
                        }
                        e.preventDefault();
                    })
                );
            } else {
                options.flags.minimized = false;
            }

            //Expand note / Maximize
            if($.fn.postitall.globals.expand && options.features.expand) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_expand_' + index,
                        'class': (options.flags.expand ? 'PIAmaximize' : 'PIAexpand') + ' PIAicon'
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            if(!options.flags.expand) {
                                t.expandNote();
                            } else {
                                t.collapseNote();
                            }
                        }
                        e.preventDefault();
                    })
                );
            } else {
                options.flags.expand = false;
            }

            //Blocked
            if($.fn.postitall.globals.blocked && options.features.blocked) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_blocked_' + index,
                        'class': 'PIAblocked' + (options.flags.blocked == true ? '2' : '') + ' PIAicon',
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            t.blockNote();
                        }
                        e.preventDefault();
                    })
                );
            }

            //Front page: content
            var content = $('<div />', {
                'id': 'pia_editable_' + index,
                'class': 'PIAeditable PIAcontent',
                //Reset herisated contenteditable styles
                //color:'+options.style.textcolor+';min-width:99%;
                'style': 'width: auto;height: auto;padding: auto;border-color: transparent;min-width:' + (options.width) + 'px;box-shadow:none;min-height:' + (options.minHeight - 100) + 'px;'
            }).change(function (e) {
                if(!$.fn.postitall.globals.editable || !options.features.editable) {
                    return;
                }

                var oldContent = options.content;

                //Html format
                var text = $(this).text();
                if ($.fn.postitall.globals.pasteHtml || options.features.pasteHtml) {
                    text = $(this).html();
                    //Default sanitize
                    text = text.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                                 //replace(/<[\/\!]*?[^<>]*?>/gi, '').
                                 replace(/<style[^>]*?>.*?<\/style>/gi, '').
                                 replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
                    //htmlClean sanitize plugin
                    if($.htmlClean !== undefined) {
                        //htmlClean plugin
                        text = $.htmlClean(text, { format: true });
                    }
                }
                //console.log('text', text);

                //$(this).html(text);
                //$(this).trumbowyg('html', text);
                t.options.content = text;

                //options.content = $(this).html();
                t.autoresize();
                t.save(obj, function(error) {
                    if(error !== undefined && error !== "") {
                        alert('Error saving content! \n\n'+error+'\n\nReverting to last known content.');
                        t.options.content = oldContent;
                        $('#pia_editable_' + t.options.id).html(oldContent);
                        $('#pia_editable_' + t.options.id).trigger('change');
                        t.autoresize();
                    }
                });
            }).html(t.options.content);

            if($.fn.postitall.globals.editable && options.features.editable) {
                content.attr('contenteditable', true);
            } else {
                content.attr('contenteditable', false).css("cursor", "auto");
            }

            //Info icon
            if(($.fn.postitall.globals.showInfo && options.features.showInfo) || ($.fn.postitall.globals.addNew && options.features.addNew)) {
                var bottomToolbar = $('<div />', {
                    'id': 'idPIAIconBottom_'+ index,
                    'class': 'PIAIconBottom'
                });
                if($.fn.postitall.globals.showInfo && options.features.showInfo) {
                    var info = $('<a />', {
                        'href': '#',
                        'id': 'idInfo_'+index,
                        'class': ' PIAicon PIAinfoIcon',
                    }).click(function(e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            $('.backContent_'+index).hide();
                            $('#idBackInfo_'+index+' > .PIABox').css({
                                //'width': options.width - 10,
                                'height': options.height - 40
                            });
                            $('#idBackInfo_'+index).show();
                            t.switchBackNoteOn('PIAflip2');
                        }
                        e.preventDefault();
                    });
                    bottomToolbar.append(info);
                }
                //New note
                if($.fn.postitall.globals.addNew && options.features.addNew) {
                    //if (options.features.addNew) {
                        var newNote = $('<a />', {
                            'href': '#',
                            'id': 'pia_new_' + index,
                            'class': 'PIAnew PIAicon'
                        }).click(function (e) {
                            if (obj.hasClass('PIAdragged')) {
                                obj.removeClass('PIAdragged');
                            } else {
                                var newOptions = {};
                                newOptions.width = options.width;
                                newOptions.width += parseInt($($.fn.postitall.globals.prefix + index).css('padding-left'), 10);
                                newOptions.width += parseInt($($.fn.postitall.globals.prefix + index).css('padding-right'), 10);
                                $.PostItAll.new({
                                    content: options.content,
                                    //position: 'absolute',
                                    //posX: e.pageX,
                                    //posY: e.pageY,
                                    posX: parseInt(options.posX, 10) + 10,
                                    posY: parseInt(options.posY, 10) + 10,
                                    width: options.width,
                                    height: options.height,
                                    features: options.features,
                                    attachedTo: options.attachedTo,
                                    style: options.style,
                                }, function(id, options, obj) {
                                    setTimeout(function() {
                                        $('.PIApostit').css('z-index', 999995);
                                        $(id).css('z-index', 999999);
                                    }, 100);
                                });
                            }
                            e.preventDefault();
                        });
                        bottomToolbar.append(newNote);
                    //}
                }
                toolbar.prepend(bottomToolbar);
            }

            //Front page
            var front = $('<div />', {
                'class': 'PIAfront',
                'dir': 'ltr',
            }).append(toolbar).append(content);

            //Creation date
            var d = new Date(options.created);
            //Back page: toolbar
            toolbar = $('<div />', { 'class': 'PIAtoolbar', 'style': barCursor })
                //Close config icon
                .append($('<div />', {
                    'id': 'pia_close_' + index,
                    'class': 'PIAclose PIAicon',
                    'style': 'display:block;'
                })
                .click(function (e) {
                    //var id = $(this).closest('.PIApostit').children().attr('data-id');
                    console.log('aki');
                    t.switchBackNoteOff('PIAflip2');
                    t.switchOnLights();
                    //t.showArrow();
                    e.preventDefault();
                })
            )
            .append($('<span />', {
                    'class': 'float-left minicolors_label',
                    'style': 'padding: 5px;font-size: 6.5px;font-family:verdana;'
                }).html(d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")")
            );
            //Back page: content
            //Background color
            var bgLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'minicolors_bg_' + index,
            }).html('Background-color:');
            var bgString = $('<input />', {
                'class': 'minicolors',
                'id': 'minicolors_bg_' + index,
                'type': 'text',
                'height': '14px',
                'style': 'font-size:smaller;',
                'value': options.style.backgroundcolor,
                'data-default-value': options.style.backgroundcolor
            });
            //Text color
            var tcLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'minicolors_text_' + index,
                'style': 'margin-top: 5px;'
            }).html('Text color:');
            var tcString = $('<input />', {
                'class': 'minicolors',
                'id': 'minicolors_text_' + index,
                'type': 'text',
                'height': '14px',
                'style': 'font-size:smaller;',
                'value': options.style.textcolor,
                'data-default-value': options.style.textcolor
            });
            //Text shadow
            var checked = '';
            if (options.style.textshadow) {
                checked = 'checked';
            }

            var tsString = $('<input />', {
                'id': 'textshadow_' + index,
                'type': 'checkbox',
                'checked': checked
            });
            var tsLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'textshadow_' + index
            }).append(tsString).append(' Text shadow');
            //3d style
            var checked2 = '';
            if (options.style.tresd) {
                checked2 = 'checked';
            }
            var gsString = $('<input />', {
                'id': 'generalstyle_' + index,
                'type': 'checkbox',
                'checked': checked2
            });
            var gsLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'generalstyle_' + index,
            }).append(gsString).append(' 3D style');

            //Add arrow selection in options
            var aaString = "";
            if($.fn.postitall.globals.addArrow == "back" || $.fn.postitall.globals.addArrow == "all"
            || options.features.addArrow == "back" || options.features.addArrow == "all") {
                aaString = $('<select />', {
                    'id': 'idAddArrow_' + index,
                    'style': 'margin-top: 5px;',
                });
                aaString.append('<option value="none" '+(options.style.arrow == "none" ? 'selected' : '')+'>Arrow in:</option>');
                aaString.append('<option value="top" '+(options.style.arrow == "top" ? 'selected' : '')+'>Top</option>');
                aaString.append('<option value="right" '+(options.style.arrow == "right" ? 'selected' : '')+'>Right</option>');
                aaString.append('<option value="bottom" '+(options.style.arrow == "bottom" ? 'selected' : '')+'>Bottom</option>');
                aaString.append('<option value="left" '+(options.style.arrow == "left" ? 'selected' : '')+'>Left</option>');
                aaString.change(function(e) {
                    options = t.arrowChangeOption($(this).val());
                    e.preventDefault();
                });
            }

            //Add User selection in options
            var uString = "";
            if( $.fn.postitall.globals.changeUserId || options.features.changeUserId ) {
                uString = $('<select />', {
                    'id': 'idChangeUserId' + index,
                    'style': 'margin-top: 5px;',
                });
                $.each(kivi.global.erp_all_users, function( index, value ) {
                    uString.append( '<option value="' + value.id + '" ' + (kivi.myconfig.id == value.id ? 'selected' : '') + '>' + value.name + '</option>' );
                });

                uString.change(function(e) {
                    otherid = $(this).val();
                    t.changeUserId();
                    e.preventDefault();
                });
            }

            //Back 1: config
            content = "";
            if($.fn.postitall.globals.changeoptions) {
                content = $('<div />', {
                    'id': 'idBackConfig_'+index,
                    'class': 'PIAcontent backContent_'+index,
                }).append($('<div />', {
                    'class': 'PIABox PIAconfigBox',
                    //'style': 'margin-left: -5px;',
                    //'width': options.width - 10,
                    //'width': 'auto',
                    'height': options.height - 40
                }).append("<div class='PIAtitle'>Note config</div>")
                    .append(bgLabel).append(bgString) // Bg color
                    .append(gsLabel)  // 3d or plain style
                    .append(tcLabel).append(tcString) // Text color
                    .append(tsLabel) // Text shadow
                    .append(aaString) //Arrow selection
                    .append("<div class='small'>Share with:</div>")
                    .append(uString) //User selection
                );
            }

            //Back 2: info
            var backInfo = "";
            if($.fn.postitall.globals.showInfo && options.features.showInfo) {
                var d = new Date(options.created);
                var textDate = d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")";
                var textInfo = "<div class='PIAtitle'>Note info</div>";
                textInfo += "<strong>Id:</strong> "+$.fn.postitall.globals.prefix+index+"<br>";
                textInfo += "<strong>Created on:</strong> "+textDate+"<br>";
                if(options.domain.indexOf("http") >= 0)
                    textInfo += "<strong>Domain:</strong> "+options.domain+"<br>";
                textInfo += "<strong>Page:</strong> "+options.page+"<br>";
                textInfo += "<strong>Op.System:</strong> " + t.getOSName() + " - "+options.osname+"<br>";
                backInfo = $('<div />', {
                    'id': 'idBackInfo_'+index,
                    'class': 'PIAcontent backContent_'+index
                }).append(
                    $('<div />', {
                        'class': 'PIAinfoBox PIABox',
                        //'style': 'margin-left: -5px;',
                        //'width': options.width - 10,
                        //'width': 'auto'
                        'height': options.height - 40
                    }).append(textInfo)
                );
            }

            //Back 3: delete
            var deleteInfo = "";
            if($.fn.postitall.globals.askOnDelete && options.features.askOnDelete) {
                deleteInfo = $('<div />', {
                    'id': 'idBackDelete_' + index,
                    'class': 'PIAcontent backContent_'+index
                }).append($('<div />', {
                        'id': 'pia_confirmdel_' + index,
                        'class': 'PIABox PIAwarningBox',
                        //'style': 'margin-left: -5px;',
                        //'width': options.width - 10,
                        //'width': 'auto',
                        'height': options.height - 40
                    }).append("<div class='PIAtitle'>Delete note!</div>")
                        .append($('<span />', {
                                'style': 'line-height:10px;font-size:10px;',
                                'class': 'PIAdelwar float-left'
                            }))
                            .append($('<div />', { 'class': 'PIAconfirmOpt' }).append(
                                    $('<a />', { 'id': 'sure_delete_' + index, 'href': '#' })
                                    .click(function(e) {
                                        t.switchOnLights();
                                        var id = obj.data('PIA-id');
                                        t.destroy();
                                        e.preventDefault();
                                    }).append($('<span />', { 'class': 'PIAdelyes' }).append("Delete this"))))
                            .append($('<div />', { 'class': 'PIAconfirmOpt' }).append(
                                    $('<a />', { 'id': 'all_' + index, 'href': '#' })
                                    .click(function(e) {
                                        t.switchOnLights();
                                        $.PostItAll.destroy();
                                        e.preventDefault();
                                    }).append($('<span />', { 'class': 'PIAdelyes' }).append("Delete all"))))
                            .append($('<div />', { 'class': 'PIAconfirmOpt' }).append(
                                    $('<a />', { 'id': 'cancel_' + index, 'href': '#' })
                                    .click(function(e) {
                                        t.switchOnLights();
                                        $('#pia_editable_' + index).show();
                                        t.switchBackNoteOff('PIAflip2');
                                        e.preventDefault();
                                    }).append($('<span />', { 'class': 'PIAdelno' }).append("Cancel"))))
                            .append($('<div />', { 'class': 'clear', 'style': 'line-height:10px;font-size:10px;font-weight: bold;' }).append("*This action cannot be undone"))
                );
            }

            //Back page
            var back = $('<div />', {
                'class': 'PIAback PIAback1 PIAback2',
                'style': 'visibility: hidden;'
            })
            .append(toolbar)
            .append(content)
            .append(backInfo)
            .append(deleteInfo);

            //Create postit
            var postit = $('<div />', {
                'id': 'idPostIt_' + index,
                'data-id': index
            });
            //Add front
            postit.append(front);

            //Add back
            //if($.fn.postitall.globals.changeoptions && options.features.changeoptions)
            postit.append(back);

            //Convert relative position to prevent height and width in html layout
            if (options.position === "relative") {
                options.position = "absolute";
                options.posY = obj.offset().top + parseInt(options.posY, 10);
                options.posY += "px";
                options.posX = obj.offset().left + parseInt(options.posX, 10);
                options.posX += "px";
            }

            //Arrow
            var arrowClases = " ";
            var arrowPaso = false;
            if($.fn.postitall.globals.addArrow != "none" && options.features.addArrow != "none") {
                arrowClases += "arrow_box";
                switch(options.style.arrow) {
                    case 'top':
                        arrowClases += ' arrow_box_top';
                        arrowPaso = true;
                    break;
                    case 'right':
                        arrowClases += ' arrow_box_right';
                        arrowPaso = true;
                    break;
                    case 'bottom':
                        arrowClases += ' arrow_box_bottom';
                        arrowPaso = true;
                    break;
                    case 'left':
                        arrowClases += ' arrow_box_left';
                        arrowPaso = true;
                    break;
                }
            }

            //Modify final Postit Object
            obj.removeClass()
                .addClass('PIApostit ' + (options.style.tresd ? ' PIApanel ' : ' PIAplainpanel ')
                    + (options.position == "fixed" ? ' fixed ' : '') + arrowClases)
                .css('position', options.position)
                .css('top', options.posY)
                .css('width', options.width + 'px')
                .css('height', options.height + 'px')
                .css('background-color', options.style.backgroundcolor)
                .css('color', options.style.textcolor)
                .css('font-family', options.style.fontfamily)
                .css('font-size', options.style.fontsize)
                .css('border-bottom-color', options.style.backgroundcolor)
                .css('border-left-color', options.style.backgroundcolor)
                .css('border-top-color', options.style.backgroundcolor)
                .css('border-right-color', options.style.backgroundcolor);

            if (options.right !== "") {
                obj.css('right', options.right);
                //options.right = "";
            } else {
                obj.css('left', options.posX)
            }
            if (options.style.textshadow) {
                obj.addClass(t.getTextShadowStyle(options.style.textcolor));
            } else {
                obj.addClass('dosd');
            }
            obj.html(postit)
            .on('focus', '#pia_editable_' + index, function () {
                options.onSelect($.fn.postitall.globals.prefix + index);

                if(options.flags.blocked)
                    return;

                if($.fn.postitall.globals.htmlEditor && options.features.htmlEditor && $.trumbowyg) {
                    var paso = false;
                    //t.hoverOptions(index, false);
                    t.toogleToolbar('hide', ['idPIAIconBottom_', 'pia_toolbar_', '.selectedArrow_']);
                    $($.fn.postitall.globals.prefix + index + ' > .ui-resizable-handle').css('visibility', 'hidden');
                    $('#pia_editable_' + index).trumbowyg({
                        //prefix: 'trumbowyg-black trumbowyg-',
                        //btns: ['bold', 'italic', 'underline', 'strikethrough', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', '|', 'link'],
                        btns: ['formatting',
                          '|', 'btnGrp-design',
                          '|', 'link',
                          '|', 'insertImage',
                          '|', 'btnGrp-justify',
                          '|', 'btnGrp-lists',
                          '|', 'horizontalRule',
                          '|', 'viewHTML'],
                        closable: true,
                        fullscreenable: false,
                        autogrow: true,
                        semantic: true,
                    })
                    .on('tbwfocus', function(){
                        //console.log('tbwfocus!');
                        //$( "#pia_editable_" + index ).dblclick();
                        //delay(function(){$( "#pia_editable_" + index ).focus();},500);
                    })
                    .on('tbwblur', function(){
                        //console.log('tbwblur!');
                        //delay(function() {
                        //    $('#pia_editable_' + index).trumbowyg('destroy');
                        //},1000);
                        //$('.trumbowyg-close-button').click();
                    })
                    .on('tbwresize', function(){
                        //console.log('tbwresize!');
                        //delay(function() {
                        //    this.autoresize($($.fn.postitall.globals.prefix + index));
                        //},1000);
                    });
                    $('#pia_editable_' + index).on('tbwclose', function(){
                        //console.log('tbwclose!');
                        $('#pia_editable_' + index).attr('contenteditable', true);
                        $('#pia_editable_' + index).css('height', 'auto');
                        t.toogleToolbar('show', ['idPIAIconBottom_', 'pia_toolbar_', '.selectedArrow_']);
                        $($.fn.postitall.globals.prefix + index + ' > .ui-resizable-handle').css('visibility', '');

                        t.autoresize();
                        var highlightedId = $("#the_lights").data('highlightedId');
                        if(highlightedId) {
                            t.collapseNote();
                        }
                        if(!paso) {
                            paso = true;
                            delay(function() {
                                options.onRelease($.fn.postitall.globals.prefix + index);
                            }, 100);
                        }
                    });
                    t.enableKeyboardNav(function() {
                        $('.trumbowyg-close-button').click();
                        t.autoresize();
                    });
                    t.autoresize();
                }
                var objeto = $(this);
                objeto.data('before', objeto.html());
                return objeto;
            })
            /*.on('focusout', '[contenteditable]', function () {
                $('#pia_editable_' + index).trumbowyg('destroy');
                $('#pia_editable_' + index).attr('contenteditable', true);
                console.log('focusout!!', '#pia_editable_' + index);
                var objeto = $(this);
                return objeto;
            })*/
            .on('blur keyup paste input', '[contenteditable]', function () {
                var objeto = $(this);
                if (objeto.data('before') !== objeto.html()) {
                    delay(function() {
                        //console.log('change!');
                        var content = objeto.text();
                        if ($.fn.postitall.globals.pasteHtml || options.features.pasteHtml)
                            content = objeto.html();
                        objeto.data('before', content);
                        objeto.trigger('change');
                        options.onChange($.fn.postitall.globals.prefix + index);
                    }, 100);
                }
                return objeto;
            })
            .click(function (e) {
                $('.PIApostit').css('z-index', 999995);
                $(this).css('z-index', 999999);
            });

            if ($.ui) {
                if ($.fn.postitall.globals.draggable && options.features.draggable) {
                    obj.draggable({
                        //handle: ".PIApostit",
                        scroll: false,
                        start: function (e) {
                            //Remove draggable postit option
                            $('.PIApostit').css('z-index', 999995);
                            $(this).css('z-index', 999999);
                            $(this).draggable('disable');
                            if(!options.flags.minimized) {
                                t.switchTrasparentNoteOn();
                            }
                            if(options.attachedTo.element !== "") {
                                options.attachedTo.element = '';
                                options.attachedTo.fixed = false;
                            }
                            obj.addClass('PIAdragged');
                            //onSelect event
                            options.onSelect($.fn.postitall.globals.prefix + options.id);
                        },
                        stop: function () {
                            //Enable draggable postit option
                            $(this).draggable('enable');
                            t.autoresize();
                            options.right = '';
                            //if ($.fn.postitall.globals.savable && options.features.savable) {
                                if(!options.flags.minimized) {
                                    options.posY = obj.css('top');
                                    options.posX = obj.css('left');
                                    options.oldPosition.leftMinimized = undefined;
                                } else {
                                    options.oldPosition.leftMinimized = obj.css('left');
                                }
                                t.saveOptions(options);
                            //}
                            if(!options.flags.minimized) {
                                t.switchTrasparentNoteOff();
                            }
                            delay(function() {
                                if (obj.hasClass('PIAdragged')) {
                                    obj.removeClass('PIAdragged');
                                    //onRelease event
                                    options.onRelease($.fn.postitall.globals.prefix + options.id);
                                }
                            }, 200);
                        }
                    });
                }
                if ($.fn.postitall.globals.resizable &&  options.features.resizable) {
                    var pos = false;
                    //console.log('options.minHeight',options.minHeight);
                    obj.resizable({
                        animate: true,
                        helper: 'ui-resizable-helper',
                        minHeight: options.minHeight,
                        minWidth: options.minWidth,
                        start: function() {
                            t.switchTrasparentNoteOn();
                            //Change minheight on resizable
                            var tmpHeigth = $('#pia_editable_'+index).height();
                            if(tmpHeigth <= options.minHeight)
                                tmpHeigth = options.minHeight;
                            //$(this).resizable({minHeight: tmpHeigth });
                            //onSelect event
                            options.onSelect($.fn.postitall.globals.prefix + options.id);
                        },
                        stop: function () {
                            delay(function(){
                                //console.log('stop autoresize');
                                t.autoresize();
                                options.right = '';
                                //if ($.fn.postitall.globals.savable && options.features.savable) {
                                    options.posY = obj.css('top');
                                    options.posX = obj.css('left');
                                    t.saveOptions(options);
                                //}
                                //onRelease event
                                options.onRelease($.fn.postitall.globals.prefix + options.id);
                            }, 1000);
                            t.switchTrasparentNoteOff();
                        }
                    });
                }
            } else {
                //TODO : Resizable without jquer-ui
                if ($.fn.postitall.globals.resizable &&  options.features.resizable) {
                    obj.css('overflow', 'hidden');
                    obj.css('resize', 'both');
                    obj.find('.PIAfront').css('height', '92%');
                    obj.find('.PIAIconBottom').css('bottom', '0%');
                }
            }
            //hide back
            $('.backContent_' + options.id).hide();

            if(!options.style.tresd) {
                $('#generalstyle_' + options.id).click();
            }
            if(!options.style.textshadow) {
                $('#textshadow_' + options.id).click();
            }
            //Postit fixed?
            if($.fn.postitall.globals.fixed && options.features.fixed && (options.flags.fixed || options.position == "fixed")) {
                options.flags.fixed = false;
                $('#pia_fixed_' + options.id).click();
            }
            //Postit expanded?
            if($.fn.postitall.globals.expand && options.features.expand && options.flags.expand) {
                options.flags.expand = false;
                $('#pia_expand_' + options.id).click();
                delay(function() {
                    $('#pia_editable_' + options.id).focus();
                },500);
            }
            //Postit bloqued?
            if(($.fn.postitall.globals.blocked || options.features.blocked) && options.flags.blocked) {
                options.flags.blocked = false;
                $('#pia_blocked_' + options.id).click();
            }
            //Postit minimized?
            if($.fn.postitall.globals.minimized && options.features.minimized && options.flags.minimized) {
                options.flags.minimized = false;
                $('#pia_minimize_' + options.id).click();
            }

            //Select arrow in front
            if( ($.fn.postitall.globals.addArrow == "front" && (options.features.addArrow == "all" || options.features.addArrow == "front"))
            || ($.fn.postitall.globals.addArrow == "all" && (options.features.addArrow == "all" || options.features.addArrow == "front")) ) {
                var checks = "<div class='PIAicon icon_box icon_box_top selectedArrow_"+index+"' data-index='"+index+"' data-value='top'><span class='ui-icon ui-icon-triangle-1-n'></span></div>";
                checks += "<div class='PIAicon icon_box icon_box_right selectedArrow_"+index+"' data-index='"+index+"' data-value='right'><span class='ui-icon ui-icon-triangle-1-e'></span></div>";
                checks += "<div class='PIAicon icon_box icon_box_bottom selectedArrow_"+index+"' data-index='"+index+"' data-value='bottom'><span class='ui-icon ui-icon-triangle-1-s'></span></div>";
                checks += "<div class='PIAicon icon_box icon_box_left selectedArrow_"+index+"' data-index='"+index+"' data-value='left'><span class='ui-icon ui-icon-triangle-1-w'></span></div>";
                obj.append(checks);

                $('.selectedArrow_'+index).click(function(e) {
                    //console.log('click al link', $(this).attr('data-index'), $(this).attr('data-value'));
                    console.log('arrowChangeOption');
                    if (obj.hasClass('PIAdragged')) {
                        obj.removeClass('PIAdragged');
                    } else {
                        options = t.arrowChangeOption($(this).attr('data-value'));
                    }
                    e.preventDefault();
                });
            }
            if(arrowPaso) {
                var icon = $($.fn.postitall.globals.prefix+index).find('div[data-value="'+options.style.arrow+'"]');
                icon.show();
                icon.find('span').hide();
                //console.log('aki?', arrowPaso, index, options.style.arrow);
            }

            //Show postit
            obj.slideDown(function () {
                //Rest of actions
                //Config: text shadow
                $('#textshadow_' + index).click(function () {

                    if ($(this).is(':checked')) {
                        $(this).closest('.PIApostit').find('.PIAcontent').addClass(t.getTextShadowStyle($('#minicolors_text_' + index).val())).removeClass('dosd');
                        options.style.textshadow = true;
                    } else {
                        $(this).closest('.PIApostit').find('.PIAcontent').addClass('dosd').removeClass('tresd').removeClass('tresdblack');
                        options.style.textshadow = false;
                    }
                    t.setOptions(options, true);
                });
                //3d or plain
                $('#generalstyle_' + index).click(function () {
                    if ($(this).is(':checked')) {
                        $($.fn.postitall.globals.prefix + index).removeClass('PIAplainpanel').addClass('PIApanel');
                        options.style.tresd = true;
                    } else {
                        $($.fn.postitall.globals.prefix + index).removeClass('PIApanel').addClass('PIAplainpanel');
                        options.style.tresd = false;
                    }
                    t.setOptions(options, true);
                });
                //Background and text color
                if ($.minicolors) {
                    //Config: change background-color
                    $('#minicolors_bg_' + index).minicolors({
                        //opacity: true,
                        change: function (hex, rgb) {
                            console.log(hex, rgb);
                            $($.fn.postitall.globals.prefix + index).css('background-color', hex);
                            //$($.fn.postitall.globals.prefix + index).css('opacity', rgb);
                            options.style.backgroundcolor = hex;
                            t.setOptions(options, true);
                        }
                    });
                    //Config: text color
                    $('#minicolors_text_' + index).minicolors({
                        change: function (hex) {
                            $($.fn.postitall.globals.prefix + index).css('color', hex);
                            options.style.textcolor = hex;
                            t.setOptions(options, true);
                        }
                    });
                } else {
                    $('#minicolors_bg_' + index).change(function () {
                        $(this).closest('.PIApostit').css('background-color', $(this).val());
                        options.style.backgroundcolor = $(this).val();
                        t.setOptions(options, true);
                    });
                    $('#minicolors_text_' + index).change(function () {
                        $(this).closest('.PIApostit').css('color', $(this).val());
                        options.style.textcolor = $(this).val();
                        t.setOptions(options, true);
                    });
                }

                //Autoresize to fit content when content load is done
                t.autoresize();
            });

            //Hover options
            if(!options.flags.minimized && !options.flags.expand && !options.flags.blocked) {
                t.hoverOptions(index, true);
            }

            //disable draggable on mouseenter in contenteditable div
            if ($.fn.postitall.globals.draggable && options.features.draggable) {
                $("#pia_editable_" + index).mouseenter(function (e) {
                    if($.ui) obj.draggable({disabled: true});
                }).mouseleave(function(e) {
                    if($.ui && !options.flags.blocked && !options.flags.expand) {
                        obj.draggable({disabled: false});
                    }
                });
            }

            //Bind paste event
            $("#pia_editable_" + index).bind('paste', function (e){
                var element = this;
                $("#pia_editable_" + index).css("opacity", "0");
                delay(function(){
                    var text = "";
                    if (!$.fn.postitall.globals.pasteHtml || !options.features.pasteHtml) {
                        //Text format
                        text = $(element).text();
                    } else {
                        //Html format
                        text = $(element).html();
                        //Default sanitize
                        text = text.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                                     //replace(/<[\/\!]*?[^<>]*?>/gi, '').
                                     replace(/<style[^>]*?>.*?<\/style>/gi, '').
                                     replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
                        //htmlClean sanitize plugin
                        if($.htmlClean !== undefined) {
                            //htmlClean plugin
                            text = $.htmlClean(text, { format: true });
                        }
                    }
                    $("#pia_editable_" + index).html(text);
                    t.autoresize();
                    $("#pia_editable_" + index).css("opacity", "1");
                }, 100);
            });

            //Bind click event
            //$(obj).click(function() {
            //    options.onSelect($.fn.postitall.globals.prefix + index);
            //});
            //Bind dblclick event
            $(obj).dblclick(function() {
                options.onDblClick($.fn.postitall.globals.prefix + index);
            });

            //Stop key propagation on contenteditable
            $("#pia_editable_" + index).keydown(function (e) {
                e.stopPropagation();
            });

            var t = this;
            setTimeout(function() {
                //Save in storage
                t.saveOptions(options);
                //OnCreated event (id, options, obj)
                options.onCreated($.fn.postitall.globals.prefix + index, options, obj);
            },200);

            //chaining
            return obj;
        }
    };

    //Drag postits
    //used if jQuery UI is not loaded
    $.fn.drags = function (opt) {

        opt = $.extend({handle: "", cursor: "move"}, opt);

        var onMouseDown = function(e) {
            var $drag;
            if (opt.handle === "") {
                $drag = $(this).parent().parent().parent().addClass('draggable');
            } else {
                $drag = $(this).parent().parent().parent().addClass('active-handle').parent().addClass('draggable');
            }
            var options = $drag.data('PIA-options');
            if(options.flags.minimized || options.flags.expand)
                return;
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            var onMouseMove = function(e) {
                $drag.addClass('PIAdragged');
                $('.draggable').offset({
                    top: e.pageY + pos_y - drg_h,
                    left: e.pageX + pos_x - drg_w
                }).on("mouseup", function () {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            };
            $drag.css('z-index', 10000).parents()
            .on("mousemove", onMouseMove)
            .on("mouseup",function() {
                $(this).off("mousemove", onMouseMove);
                delay(function() {
                    $drag.removeClass('PIAdragged');
                },200);
            });
            e.preventDefault(); // disable selection
        };

        var onMouseUp = function(e) {
            var $drag;
            if (opt.handle === "") {
                $(this).removeClass('draggable');
                $drag = $(this).parent().parent().parent();
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
                $drag = $(this).parent().parent().parent().parent();
            }
            var options = $drag.data('PIA-options');
            options.right = '';
            if(!options.flags.minimized) {
                options.posY = $drag.css('top');
                options.posX = $drag.css('left');
                options.oldPosition.leftMinimized = undefined;
            } else {
                options.oldPosition.leftMinimized = $drag.css('left');
            }
            $($.fn.postitall.globals.prefix + options.id).postitall('save', options);
        };

        var $el = this;
        if (opt.handle !== "") {
            $el = this.find(opt.handle);
        }
        return $el.css('cursor', opt.cursor).on("mousedown", onMouseDown).on("mouseup", onMouseUp);
    };

    //Delay repetitive actions
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    /********* STORAGE ************/

    // Global storage var
    var $storage = null;

    // Storage Manager
    var storageManager = {
        add: function (obj, callback) {
            this.loadManager(function() {
                $storage.add(obj, function(error) {
                    if(callback != null) callback(error);
                });
            });
        },
        get: function (id, callback) {
            this.loadManager(function() {
                $storage.get(id, function(varvalue) {
                    if(callback != null) callback(varvalue);
                });
            });
        },
        getAll: function (callback) {
            this.loadManager(function() {
                $storage.getAll(function(varvalue) {
                    if(callback != null) callback(varvalue);
                });
            });
        },
        getByKey: function (key, callback) {
            this.loadManager(function() {
                if (key != null && key.slice(0,7) === "PostIt_") {
                    key = key.slice(7,key.length);
                    storageManager.get(key, callback);
                } else {
                    if(callback != null) callback(null);
                }
            });
        },
        remove: function (id, callback) {
            this.loadManager(function() {
                $storage.remove(id, function(varvalue) {
                    if(callback != null) callback();
                });
            });
        },
        removeDom: function (options, callback) {
            this.loadManager(function() {
                $storage.removeDom(options, function() {
                    if(callback != null) callback();
                });
            });
        },
        clear: function (options, callback) {
            this.loadManager(function() {
                $storage.clear(function() {
                    if(callback != null) callback();
                });
            });
        },
        getlength: function (callback) {
            this.loadManager(function() {
                $storage.getlength(function(length) {
                    if(callback != null) callback(length);
                });
            });
        },
        key: function (i, callback) {
            this.loadManager(function() {
                $storage.key(i, function(name) {
                    if(callback != null) callback(name);
                });
            });
        },
        view: function (callback) {
            this.loadManager(function() {
                $storage.view();
            });
        },
        //Load storage manager
        loadManager: function(callback) {
            if($storage === null) {
                this.getStorageManager(function($tmpStorage) {
                    $storage = $tmpStorage;
                    callback($storage)
                });
            } else {
                callback($storage);
            }
        },
        // Get storage manager
        getStorageManager: function(callback) {
            if (typeof externalManager !== 'undefined') callback(externalManager);
            else callback(localManager);
        }
    };

    // local storage manager
    var localManager = {
        add: function (obj, callback) {
            var varname = 'PostIt_' + obj.id.toString();
            var testPrefs = JSON.stringify(obj);
            $localStorage.setItem(varname, testPrefs);
            //console.log('Saved', varname, testPrefs);
            if(callback != null) callback("");
        },
        get: function (id, callback) {
            var varname = 'PostIt_' + id.toString();
            var varvalue = $localStorage.getItem(varname);
            if(varvalue != null)
                varvalue = JSON.parse(varvalue);
            else
                varvalue = "";
            //console.log('Loaded', varname, varvalue);
            if(callback != null) callback(varvalue);
        },
        remove: function (id, callback) {
            $localStorage.removeItem('PostIt_' + id);
            if(callback != null) callback();
        },
        removeDom: function (options, callback) {
            this.clear(callback);
        },
        clear: function (callback) {
            $localStorage.clear();
            if(callback != null) callback();
        },
        getlength: function (callback) {
            callback($localStorage.length);
        },
        key: function (i, callback) {
            i--;
            var name = $localStorage.key(i);
            callback(name);
        },
        view: function () {
            console.log('view local');
            console.log($localStorage);
        },
        getAll: function (callback) {
            console.log('TODO getAll on localStorage');
        }
    };

}(jQuery, window.localStorage));