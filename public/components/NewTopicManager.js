import swal from "sweetalert";
class NewTopicManager{
    constructor(){
        this.area=document.createElement("ul");
        this.li=document.createElement("li");
        let aiActorlistContent="";
        const aiActors=document.querySelectorAll("")
    }
    processAIActor(){
        swal({
            title:"Choose the AI Actor",
            content:this.area,
            buttons:{
                newTopic:{
                    text:"New Topic",
                    value:"new topic",
                    className:"new-topic-button",
 
                },
                cancel:"Close"

            },
            className:"new-topic-modal",
            closeOnClickOutside:false,
        })
        .then((value)=>{
            switch(value){
                case "new topic":
                    
                    
                  
            }
        });
    }
}
  
