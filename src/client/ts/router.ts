import { initNotes } from "./components/notes.js";
import { initTasks } from "./components/tasks.js";

export function showMainMenu(): void {
  //click on logo, back to main layout
  const portal = document.getElementById("portalScreen");
  const content = document.getElementById("content");
  if (portal) {
    portal.classList.remove("hidden");
  }
  if (content) {
    content.classList.add("hidden");
    content.innerHTML = "";
  }
}

export function navigateToApp(): void {
  //skip to content(hides portal)
  const portal = document.getElementById("portalScreen");
  const content = document.getElementById("content");
  if (portal) {
    portal.classList.add("hidden");
  }
  if (content) {
    content.classList.remove("hidden");
    if (!content.innerHTML.trim()) {
      content.innerHTML = `<p>> now what? </p>`;
    }
  }
}

export function initRouter(): void {}

export function loadSection(section: string): void {
  const content = document.getElementById("content");
  if (!content) return;

  switch (section) {
    case "notes":
      initNotes();
      break;
    case "tasks":
      initTasks();
      break;
    default:
      const asciiArt = `
                               *#***#=                               
                              *::-==::*                              
                              *:--==-:*                              
                             #::-====::#                             
                             *:--==+=-:#                             
                            %::-======::%                            
                            . ======+== .                            
                           .             .                           
                           .             .                           
                          .           .   :                          
                         .            ..  ..                         
                         :            ..   :                         
                        *:: .         ... :=#                        
                        #:-=========+++*+=::%                        
                       %::===========++*+=-::%                       
                       %:-=+====-====++**+=::%                       
                      %::-==========+++***=-::%                      
                      %:-=+======-===+++**+=-:%                      
                     : ===+==========++****=-- :                     
                     : .::   =+=====++*+ ..::. :.                    
                    :  :::            .....::.  :                    
                   :: .::.            .....:::. ::                   
                   :  :::             .....:::.  :                   
                  -  .:::             .....::::. :-                  
                 +%:.:::              .....::::: :%+                 
             =+*+%::-=+*-             .....:=*+=-:+%+**=             
          ****+**%::=+**==============+++******==::%*++****          
      :*******++%.:-=+*=========-=====+++******+=-::%+********-      
   :************%::==**=========-=====++++******==::%**+*********:   
   #*********+++.:-=+**===============+++*******+=-::*+**********#   
   %%%=*********%===**==========-=====+++********===%*+*******+%%%   
    %%%%%+****++*###*-==========-=====++++*****-*###*+*****+%%%%%    
       #%%%##-**+***********:.         .:***********+*+-**#%%#       
          *##***:***********************************:#*****          
              **###*-***************************=#####*              
                 *#####.++*****************+*.%####*                 
                     ####%*=+++++++++++++=*%##%*                     
                        *#%%%% +==+===.%%%%#*                        
                           :#%##**+**##%#-                           
                               #**++*#                                                                                                                                     
    `;
      content.innerHTML = `<pre>${asciiArt}</pre><p>> ${section.toUpperCase()} selected.</p>`;
  }

  content.classList.remove("hidden");
}

export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
