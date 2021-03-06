var Interfacerequest = new Class({
    create: function( arguments ){
        // Take along with us any argument passed to the Interface call
        this.file = arguments.file;
        this.command = arguments.command;
        this.type = arguments.type;
        this.caller = arguments.caller;
        this.success_function = arguments.done;
        this.pass_along = arguments.pass_along;
        this.tries_left = 10;
    },

    execute: function(){
        // This is one less tries
        this.tries_left--;

        // If we tried too many times
        if( this.tries_left == 0 ){
            this.parent_queue.request_failed(this);
            console.log("too many errors");
            return;
        }

        // Make a new ajax request from ourself
        if( this.type == 'file'){
            // We are requesting a file
            $.ajax({ 
                url: "http://" + this.parent_queue.parent_interface.machine.ip + this.file, 
                timeout: 2000 , 
                interface_request: this,
                interface_caller: this.caller,
                success_function: this.success_function,
                pass_along: this.pass_along,
                type: "GET",
                async: true,
            }).done( this.request_successful ).fail( this.request_failed );
        }else if( this.type == 'command' ){
            // We are sending a command
             $.ajax({ 
                url: "http://" + this.parent_queue.parent_interface.machine.ip + "/command", 
                timeout: 2000 , 
                interface_request: this,
                interface_caller: this.caller,
                success_function: this.success_function,
                pass_along: this.pass_along,
                type: "POST",
                async: true,
                data: this.command,
            }).done( this.request_successful ).fail( this.request_failed );
        }else{
            console.log("ERROR: unknown request type, this should never happen");
        }

    },

    request_successful: function(data, state, xhr){
        // Pass back the request to the queue
        var queue = this.interface_request.parent_queue;
        queue.request_successful.call(queue,this,data,state,xhr);
    },

    request_failed: function(xhr, status){
        // There was some sort of problem with the request
        this.interface_request.execute();
    }



});
